local DATA_FILE = "snipchat_data.json"
local DB_PREFIX = "snipchat"

local State = {
    users = {},
    stories = {},
    friendRequests = {},
    conversations = {},
    messages = {},
    nextFriendRequestId = 1,
    nextConversationId = 1,
    nextMessageId = 1,
    nextStoryId = 1
}

local UsingDatabase = false

local function loadState()
    local raw = LoadResourceFile(GetCurrentResourceName(), DATA_FILE)
    if not raw or raw == "" then
        return
    end

    local ok, decoded = pcall(json.decode, raw)
    if ok and type(decoded) == "table" then
        State.users = decoded.users or {}
        State.stories = decoded.stories or {}
        State.friendRequests = decoded.friendRequests or {}
        State.conversations = decoded.conversations or {}
        State.messages = decoded.messages or {}
        State.nextFriendRequestId = decoded.nextFriendRequestId or 1
        State.nextConversationId = decoded.nextConversationId or 1
        State.nextMessageId = decoded.nextMessageId or 1
        State.nextStoryId = decoded.nextStoryId or 1
    end
end

local function saveState()
    local encoded = json.encode(State)
    SaveResourceFile(GetCurrentResourceName(), DATA_FILE, encoded, -1)
end

local function nowTimeString()
    return os.date("%H:%M")
end

local function getIdentifier(source)
    local identifiers = GetPlayerIdentifiers(source)
    for _, identifier in ipairs(identifiers) do
        if identifier:find("license:", 1, true) == 1 then
            return identifier
        end
    end

    return identifiers[1] or ("src:%s"):format(source)
end

local function isOnlineByIdentifier(identifier)
    for _, player in ipairs(GetPlayers()) do
        local id = getIdentifier(tonumber(player))
        if id == identifier then
            return true
        end
    end

    return false
end

local function normalizeUsername(username)
    return string.lower((username or ""):gsub("[^%w_]", ""))
end

local function hashPassword(password)
    return tostring(GetHashKey((password or "") .. "_snipchat"))
end

local function makeAvatar(displayName)
    local initials = ""
    for part in string.gmatch(displayName or "", "%S+") do
        initials = initials .. string.sub(part, 1, 1)
    end

    initials = string.upper(string.sub(initials, 1, 2))
    return initials ~= "" and initials or "SC"
end

local function publicAccount(user, identifier)
    if not user then
        return nil
    end

    return {
        id = identifier,
        username = user.username,
        displayName = user.displayName,
        bio = user.bio or "",
        avatar = user.avatar or makeAvatar(user.displayName)
    }
end

local function hasMySQL()
    return type(MySQL) == "table" and MySQL.query and MySQL.query.await and MySQL.single and MySQL.single.await
end

local function dbQuery(query, params)
    return MySQL.query.await(query, params or {})
end

local function dbSingle(query, params)
    return MySQL.single.await(query, params or {})
end

local function dbUpdate(query, params)
    return MySQL.update.await(query, params or {})
end

local function dbInsert(query, params)
    return MySQL.insert.await(query, params or {})
end

local function orderedPair(a, b)
    if a < b then
        return a, b
    end

    return b, a
end

local dbEnsureConversation
local fileEnsureConversation

local function setupDatabase()
    if not hasMySQL() then
        return false
    end

    dbUpdate(([=[
        CREATE TABLE IF NOT EXISTS `%s_accounts` (
            `identifier` VARCHAR(80) NOT NULL,
            `username` VARCHAR(32) NOT NULL,
            `display_name` VARCHAR(64) NOT NULL,
            `bio` VARCHAR(255) NOT NULL DEFAULT '',
            `password_hash` VARCHAR(64) NOT NULL DEFAULT '',
            `avatar` VARCHAR(8) NOT NULL DEFAULT 'SC',
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`identifier`),
            UNIQUE KEY `uniq_username` (`username`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]=]):format(DB_PREFIX), {})

    pcall(function()
        dbUpdate(([[
            ALTER TABLE `%s_accounts`
            ADD COLUMN `password_hash` VARCHAR(64) NOT NULL DEFAULT ''
        ]]):format(DB_PREFIX), {})
    end)

    dbUpdate(([=[
        CREATE TABLE IF NOT EXISTS `%s_friends` (
            `user_a` VARCHAR(80) NOT NULL,
            `user_b` VARCHAR(80) NOT NULL,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`user_a`, `user_b`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]=]):format(DB_PREFIX), {})

    dbUpdate(([=[
        CREATE TABLE IF NOT EXISTS `%s_friend_requests` (
            `id` BIGINT NOT NULL AUTO_INCREMENT,
            `sender_identifier` VARCHAR(80) NOT NULL,
            `receiver_identifier` VARCHAR(80) NOT NULL,
            `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uniq_pending_pair` (`sender_identifier`, `receiver_identifier`, `status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]=]):format(DB_PREFIX), {})

    dbUpdate(([=[
        CREATE TABLE IF NOT EXISTS `%s_conversations` (
            `id` BIGINT NOT NULL AUTO_INCREMENT,
            `user_a` VARCHAR(80) NOT NULL,
            `user_b` VARCHAR(80) NOT NULL,
            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uniq_pair` (`user_a`, `user_b`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]=]):format(DB_PREFIX), {})

    dbUpdate(([=[
        CREATE TABLE IF NOT EXISTS `%s_messages` (
            `id` BIGINT NOT NULL AUTO_INCREMENT,
            `conversation_id` BIGINT NOT NULL,
            `sender_identifier` VARCHAR(80) NOT NULL,
            `message_type` ENUM('text', 'snap') NOT NULL DEFAULT 'text',
            `content` VARCHAR(512) NOT NULL,
            `media_url` TEXT NULL,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_conversation` (`conversation_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]=]):format(DB_PREFIX), {})

    dbUpdate(([=[
        CREATE TABLE IF NOT EXISTS `%s_stories` (
            `id` BIGINT NOT NULL AUTO_INCREMENT,
            `owner_identifier` VARCHAR(80) NOT NULL,
            `caption` VARCHAR(120) NOT NULL,
            `media_url` TEXT NULL,
            `posted_at` VARCHAR(16) NOT NULL,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_owner` (`owner_identifier`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]=]):format(DB_PREFIX), {})

    return true
end

local function dbGetUserByIdentifier(identifier)
    local row = dbSingle(([[
        SELECT identifier, username, display_name, bio, password_hash, avatar
        FROM `%s_accounts`
        WHERE identifier = ?
    ]]):format(DB_PREFIX), { identifier })

    if not row then
        return nil
    end

    return {
        username = row.username,
        displayName = row.display_name,
        bio = row.bio,
        passwordHash = row.password_hash,
        avatar = row.avatar
    }
end

local function dbFindUserByUsername(username)
    local row = dbSingle(([[
        SELECT identifier, username, display_name, bio, password_hash, avatar
        FROM `%s_accounts`
        WHERE username = ?
    ]]):format(DB_PREFIX), { username })

    if not row then
        return nil, nil
    end

    return {
        username = row.username,
        displayName = row.display_name,
        bio = row.bio,
        passwordHash = row.password_hash,
        avatar = row.avatar
    }, row.identifier
end

local function dbRegisterUser(identifier, username, displayName, bio, passwordHash)
    local avatar = makeAvatar(displayName)
    dbUpdate(([[
        INSERT INTO `%s_accounts` (identifier, username, display_name, bio, password_hash, avatar)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            display_name = VALUES(display_name),
            bio = VALUES(bio),
            password_hash = VALUES(password_hash),
            avatar = VALUES(avatar)
    ]]):format(DB_PREFIX), { identifier, username, displayName, bio or "", passwordHash, avatar })

    return {
        username = username,
        displayName = displayName,
        bio = bio or "",
        passwordHash = passwordHash,
        avatar = avatar
    }
end

local function dbSaveUser(identifier, username, displayName, bio)
    local avatar = makeAvatar(displayName)
    dbUpdate(([[
        INSERT INTO `%s_accounts` (identifier, username, display_name, bio, avatar)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            display_name = VALUES(display_name),
            bio = VALUES(bio),
            avatar = VALUES(avatar)
    ]]):format(DB_PREFIX), { identifier, username, displayName, bio or "", avatar })

    return {
        username = username,
        displayName = displayName,
        bio = bio or "",
        avatar = avatar
    }
end

local function dbAreFriends(identifierA, identifierB)
    local a, b = orderedPair(identifierA, identifierB)
    local row = dbSingle(([[
        SELECT user_a FROM `%s_friends` WHERE user_a = ? AND user_b = ?
    ]]):format(DB_PREFIX), { a, b })

    return row ~= nil
end

local function dbListFriends(identifier)
    local rows = dbQuery(([[
        SELECT
            CASE WHEN f.user_a = ? THEN f.user_b ELSE f.user_a END AS identifier,
            a.display_name,
            a.username,
            a.avatar
        FROM `%s_friends` f
        JOIN `%s_accounts` a
            ON a.identifier = CASE WHEN f.user_a = ? THEN f.user_b ELSE f.user_a END
        WHERE f.user_a = ? OR f.user_b = ?
        ORDER BY a.display_name ASC
    ]]):format(DB_PREFIX, DB_PREFIX), { identifier, identifier, identifier, identifier, identifier })

    local friends = {}
    for _, row in ipairs(rows or {}) do
        friends[#friends + 1] = {
            id = row.identifier,
            name = row.display_name,
            username = row.username,
            avatar = row.avatar,
            isOnline = isOnlineByIdentifier(row.identifier),
            streak = 0
        }
    end

    return friends
end

local function dbHasPendingFriendRequest(sender, receiver)
    local row = dbSingle(([[
        SELECT id FROM `%s_friend_requests`
        WHERE sender_identifier = ?
          AND receiver_identifier = ?
          AND status = 'pending'
    ]]):format(DB_PREFIX), { sender, receiver })

    return row ~= nil
end

local function dbCreateFriendRequest(sender, receiver)
    if dbHasPendingFriendRequest(sender, receiver) or dbHasPendingFriendRequest(receiver, sender) then
        return
    end

    dbInsert(([[
        INSERT INTO `%s_friend_requests` (sender_identifier, receiver_identifier, status)
        VALUES (?, ?, 'pending')
    ]]):format(DB_PREFIX), { sender, receiver })
end

local function dbListFriendRequests(identifier)
    local rows = dbQuery(([[
        SELECT
            fr.id,
            fr.sender_identifier,
            fr.created_at,
            a.display_name,
            a.username,
            a.avatar
        FROM `%s_friend_requests` fr
        JOIN `%s_accounts` a ON a.identifier = fr.sender_identifier
        WHERE fr.receiver_identifier = ?
          AND fr.status = 'pending'
        ORDER BY fr.id DESC
    ]]):format(DB_PREFIX, DB_PREFIX), { identifier })

    local requests = {}
    for _, row in ipairs(rows or {}) do
        requests[#requests + 1] = {
            id = tostring(row.id),
            from = {
                id = row.sender_identifier,
                name = row.display_name,
                username = row.username,
                avatar = row.avatar,
                isOnline = isOnlineByIdentifier(row.sender_identifier),
                streak = 0
            },
            createdAt = tostring(row.created_at)
        }
    end

    return requests
end

local function dbRespondFriendRequest(requestId, receiverIdentifier, accept)
    local row = dbSingle(([[
        SELECT id, sender_identifier, receiver_identifier, status
        FROM `%s_friend_requests`
        WHERE id = ?
    ]]):format(DB_PREFIX), { tonumber(requestId) })

    if not row or row.receiver_identifier ~= receiverIdentifier or row.status ~= "pending" then
        return false
    end

    if accept then
        local a, b = orderedPair(row.sender_identifier, row.receiver_identifier)
        dbUpdate(([[
            INSERT IGNORE INTO `%s_friends` (user_a, user_b)
            VALUES (?, ?)
        ]]):format(DB_PREFIX), { a, b })

        dbEnsureConversation(row.sender_identifier, row.receiver_identifier)

        dbUpdate(([[
            UPDATE `%s_friend_requests`
            SET status = 'accepted'
            WHERE id = ?
        ]]):format(DB_PREFIX), { row.id })
    else
        dbUpdate(([[
            UPDATE `%s_friend_requests`
            SET status = 'rejected'
            WHERE id = ?
        ]]):format(DB_PREFIX), { row.id })
    end

    return true
end

dbEnsureConversation = function(identifierA, identifierB)
    local a, b = orderedPair(identifierA, identifierB)
    local existing = dbSingle(([[
        SELECT id FROM `%s_conversations` WHERE user_a = ? AND user_b = ?
    ]]):format(DB_PREFIX), { a, b })

    if existing then
        return tostring(existing.id)
    end

    local insertedId = dbInsert(([[
        INSERT INTO `%s_conversations` (user_a, user_b)
        VALUES (?, ?)
    ]]):format(DB_PREFIX), { a, b })

    return tostring(insertedId)
end

local function dbResolveConversationFriend(conversationId, viewerIdentifier)
    local row = dbSingle(([[
        SELECT user_a, user_b FROM `%s_conversations` WHERE id = ?
    ]]):format(DB_PREFIX), { tonumber(conversationId) })

    if not row then
        return nil
    end

    if row.user_a == viewerIdentifier then
        return row.user_b
    end

    if row.user_b == viewerIdentifier then
        return row.user_a
    end

    return nil
end

local function dbInsertMessage(conversationId, senderIdentifier, messageType, content, mediaUrl)
    dbInsert(([[
        INSERT INTO `%s_messages` (conversation_id, sender_identifier, message_type, content, media_url)
        VALUES (?, ?, ?, ?, ?)
    ]]):format(DB_PREFIX), {
        tonumber(conversationId),
        senderIdentifier,
        messageType,
        content,
        mediaUrl
    })

    dbUpdate(([[
        UPDATE `%s_conversations`
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ]]):format(DB_PREFIX), { tonumber(conversationId) })
end

local function dbListConversations(identifier)
    local rows = dbQuery(([[
        SELECT
            c.id,
            c.user_a,
            c.user_b,
            COALESCE(m.content, '') AS last_content,
            COALESCE(DATE_FORMAT(m.created_at, '%%H:%%i'), DATE_FORMAT(c.updated_at, '%%H:%%i')) AS updated_at
        FROM `%s_conversations` c
        LEFT JOIN `%s_messages` m
            ON m.id = (
                SELECT m2.id
                FROM `%s_messages` m2
                WHERE m2.conversation_id = c.id
                ORDER BY m2.id DESC
                LIMIT 1
            )
        WHERE c.user_a = ? OR c.user_b = ?
        ORDER BY c.updated_at DESC
    ]]):format(DB_PREFIX, DB_PREFIX, DB_PREFIX), { identifier, identifier })

    local conversations = {}
    for _, row in ipairs(rows or {}) do
        local friendId = row.user_a == identifier and row.user_b or row.user_a
        conversations[#conversations + 1] = {
            id = tostring(row.id),
            friendId = friendId,
            lastMessage = row.last_content ~= "" and row.last_content or "Aucun message",
            updatedAt = row.updated_at,
            unread = 0
        }
    end

    return conversations
end

local function dbListMessages(identifier, conversationId, page, pageSize)
    page = math.max(1, tonumber(page) or 1)
    pageSize = math.min(100, math.max(10, tonumber(pageSize) or 40))
    local offset = (page - 1) * pageSize

    local friendIdentifier = dbResolveConversationFriend(conversationId, identifier)
    if not friendIdentifier then
        return {}
    end

    local rows = dbQuery(([[
        SELECT id, conversation_id, sender_identifier, message_type, content, created_at
        FROM `%s_messages`
        WHERE conversation_id = ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    ]]):format(DB_PREFIX), { tonumber(conversationId), pageSize, offset })

    local messages = {}
    for i = #rows, 1, -1 do
        local row = rows[i]
        messages[#messages + 1] = {
            id = tostring(row.id),
            chatId = tostring(row.conversation_id),
            authorId = row.sender_identifier,
            content = row.content,
            createdAt = os.date("%H:%M", os.time()),
            type = row.message_type,
            mine = row.sender_identifier == identifier
        }
    end

    return messages
end

local function dbSearchUsers(identifier, query, page, pageSize)
    page = math.max(1, tonumber(page) or 1)
    pageSize = math.min(50, math.max(5, tonumber(pageSize) or 10))
    local offset = (page - 1) * pageSize

    local q = "%" .. (query or "") .. "%"

    local countRow = dbSingle(([[
        SELECT COUNT(*) AS total
        FROM `%s_accounts`
        WHERE identifier <> ?
          AND (username LIKE ? OR display_name LIKE ?)
    ]]):format(DB_PREFIX), { identifier, q, q })

    local rows = dbQuery(([[
        SELECT identifier, username, display_name, avatar
        FROM `%s_accounts`
        WHERE identifier <> ?
          AND (username LIKE ? OR display_name LIKE ?)
        ORDER BY display_name ASC
        LIMIT ? OFFSET ?
    ]]):format(DB_PREFIX), { identifier, q, q, pageSize, offset })

    local users = {}
    for _, row in ipairs(rows or {}) do
        local isFriend = dbAreFriends(identifier, row.identifier)
        local hasPending = dbHasPendingFriendRequest(identifier, row.identifier) or dbHasPendingFriendRequest(row.identifier, identifier)

        users[#users + 1] = {
            id = row.identifier,
            username = row.username,
            displayName = row.display_name,
            avatar = row.avatar,
            isFriend = isFriend,
            hasPending = hasPending
        }
    end

    local total = tonumber(countRow and countRow.total or 0) or 0
    local totalPages = math.max(1, math.ceil(total / pageSize))

    return {
        users = users,
        page = page,
        pageSize = pageSize,
        total = total,
        totalPages = totalPages
    }
end

local function dbCreateStory(ownerIdentifier, caption, mediaUrl)
    dbInsert(([[
        INSERT INTO `%s_stories` (owner_identifier, caption, media_url, posted_at)
        VALUES (?, ?, ?, ?)
    ]]):format(DB_PREFIX), { ownerIdentifier, caption, mediaUrl, nowTimeString() })
end

local function dbListStoriesFor(identifier)
    local rows = dbQuery(([[
        SELECT
            s.id,
            s.owner_identifier,
            s.caption,
            s.posted_at,
            a.display_name,
            a.avatar
        FROM `%s_stories` s
        JOIN `%s_accounts` a ON a.identifier = s.owner_identifier
        WHERE s.owner_identifier = ?
           OR s.owner_identifier IN (
                SELECT CASE WHEN f.user_a = ? THEN f.user_b ELSE f.user_a END
                FROM `%s_friends` f
                WHERE f.user_a = ? OR f.user_b = ?
           )
        ORDER BY s.id DESC
        LIMIT 30
    ]]):format(DB_PREFIX, DB_PREFIX, DB_PREFIX), { identifier, identifier, identifier, identifier, identifier })

    local stories = {}
    for _, row in ipairs(rows or {}) do
        stories[#stories + 1] = {
            id = tostring(row.id),
            friendId = row.owner_identifier,
            name = row.display_name,
            avatar = row.avatar or makeAvatar(row.display_name),
            mediaLabel = row.caption,
            postedAt = row.posted_at,
            viewed = false
        }
    end

    return stories
end

local function fileGetUserByIdentifier(identifier)
    return State.users[identifier]
end

local function fileFindUserByUsername(username)
    local wanted = normalizeUsername(username)
    if wanted == "" then
        return nil, nil
    end

    for identifier, user in pairs(State.users) do
        if normalizeUsername(user.username) == wanted then
            return user, identifier
        end
    end

    return nil, nil
end

local function fileAreFriends(identifierA, identifierB)
    local user = State.users[identifierA]
    if not user then
        return false
    end

    for _, friendId in ipairs(user.friends or {}) do
        if friendId == identifierB then
            return true
        end
    end

    return false
end

local function fileListFriends(identifier)
    local user = State.users[identifier]
    local list = {}
    if not user then
        return list
    end

    for _, friendId in ipairs(user.friends or {}) do
        local friendUser = State.users[friendId]
        if friendUser then
            list[#list + 1] = {
                id = friendId,
                name = friendUser.displayName,
                username = friendUser.username,
                avatar = friendUser.avatar,
                isOnline = isOnlineByIdentifier(friendId),
                streak = 0
            }
        end
    end

    return list
end

local function fileHasPendingRequest(sender, receiver)
    for _, request in ipairs(State.friendRequests) do
        if request.sender == sender and request.receiver == receiver and request.status == "pending" then
            return true
        end
    end

    return false
end

local function fileCreateFriendRequest(sender, receiver)
    if fileHasPendingRequest(sender, receiver) or fileHasPendingRequest(receiver, sender) then
        return
    end

    State.friendRequests[#State.friendRequests + 1] = {
        id = State.nextFriendRequestId,
        sender = sender,
        receiver = receiver,
        status = "pending",
        createdAt = nowTimeString()
    }
    State.nextFriendRequestId = State.nextFriendRequestId + 1
    saveState()
end

local function fileListFriendRequests(identifier)
    local list = {}
    for _, request in ipairs(State.friendRequests) do
        if request.receiver == identifier and request.status == "pending" then
            local sender = State.users[request.sender]
            if sender then
                list[#list + 1] = {
                    id = tostring(request.id),
                    from = {
                        id = request.sender,
                        name = sender.displayName,
                        username = sender.username,
                        avatar = sender.avatar,
                        isOnline = isOnlineByIdentifier(request.sender),
                        streak = 0
                    },
                    createdAt = request.createdAt
                }
            end
        end
    end

    return list
end

local function fileRespondFriendRequest(requestId, receiver, accept)
    local numericId = tonumber(requestId)
    for _, request in ipairs(State.friendRequests) do
        if request.id == numericId and request.receiver == receiver and request.status == "pending" then
            if accept then
                request.status = "accepted"
                local senderUser = State.users[request.sender]
                local receiverUser = State.users[receiver]
                if senderUser and receiverUser then
                    senderUser.friends = senderUser.friends or {}
                    receiverUser.friends = receiverUser.friends or {}
                    if not fileAreFriends(request.sender, receiver) then
                        senderUser.friends[#senderUser.friends + 1] = receiver
                        receiverUser.friends[#receiverUser.friends + 1] = request.sender
                    end

                    fileEnsureConversation(request.sender, receiver)
                end
            else
                request.status = "rejected"
            end

            saveState()
            return true
        end
    end

    return false
end

fileEnsureConversation = function(identifierA, identifierB)
    local a, b = orderedPair(identifierA, identifierB)
    for _, conversation in ipairs(State.conversations) do
        if conversation.userA == a and conversation.userB == b then
            return tostring(conversation.id)
        end
    end

    local conversation = {
        id = State.nextConversationId,
        userA = a,
        userB = b,
        updatedAt = nowTimeString()
    }

    State.nextConversationId = State.nextConversationId + 1
    State.conversations[#State.conversations + 1] = conversation
    saveState()

    return tostring(conversation.id)
end

local function fileResolveConversationFriend(conversationId, viewer)
    local numericId = tonumber(conversationId)
    for _, conversation in ipairs(State.conversations) do
        if conversation.id == numericId then
            if conversation.userA == viewer then
                return conversation.userB
            end
            if conversation.userB == viewer then
                return conversation.userA
            end
            return nil
        end
    end

    return nil
end

local function fileInsertMessage(conversationId, sender, messageType, content, mediaUrl)
    State.messages[#State.messages + 1] = {
        id = State.nextMessageId,
        conversationId = tonumber(conversationId),
        sender = sender,
        type = messageType,
        content = content,
        mediaUrl = mediaUrl,
        createdAt = nowTimeString()
    }
    State.nextMessageId = State.nextMessageId + 1

    for _, conversation in ipairs(State.conversations) do
        if conversation.id == tonumber(conversationId) then
            conversation.updatedAt = nowTimeString()
            break
        end
    end

    saveState()
end

local function fileListConversations(identifier)
    local list = {}
    for _, conversation in ipairs(State.conversations) do
        if conversation.userA == identifier or conversation.userB == identifier then
            local friendId = conversation.userA == identifier and conversation.userB or conversation.userA
            local lastMessage = "Aucun message"
            for i = #State.messages, 1, -1 do
                local msg = State.messages[i]
                if msg.conversationId == conversation.id then
                    lastMessage = msg.content
                    break
                end
            end

            list[#list + 1] = {
                id = tostring(conversation.id),
                friendId = friendId,
                lastMessage = lastMessage,
                updatedAt = conversation.updatedAt,
                unread = 0
            }
        end
    end

    table.sort(list, function(a, b)
        return a.id > b.id
    end)

    return list
end

local function fileListMessages(identifier, conversationId, page, pageSize)
    local friend = fileResolveConversationFriend(conversationId, identifier)
    if not friend then
        return {}
    end

    page = math.max(1, tonumber(page) or 1)
    pageSize = math.min(100, math.max(10, tonumber(pageSize) or 40))

    local all = {}
    for _, msg in ipairs(State.messages) do
        if msg.conversationId == tonumber(conversationId) then
            all[#all + 1] = {
                id = tostring(msg.id),
                chatId = tostring(msg.conversationId),
                authorId = msg.sender,
                content = msg.content,
                createdAt = msg.createdAt,
                type = msg.type,
                mine = msg.sender == identifier
            }
        end
    end

    local startIndex = math.max(1, #all - pageSize + 1)
    local subset = {}
    for i = startIndex, #all do
        subset[#subset + 1] = all[i]
    end

    return subset
end

local function fileSearchUsers(identifier, query, page, pageSize)
    page = math.max(1, tonumber(page) or 1)
    pageSize = math.min(50, math.max(5, tonumber(pageSize) or 10))
    local q = string.lower(query or "")

    local filtered = {}
    for id, user in pairs(State.users) do
        if id ~= identifier then
            local match = q == "" or string.find(string.lower(user.username), q, 1, true) or string.find(string.lower(user.displayName), q, 1, true)
            if match then
                filtered[#filtered + 1] = {
                    id = id,
                    username = user.username,
                    displayName = user.displayName,
                    avatar = user.avatar,
                    isFriend = fileAreFriends(identifier, id),
                    hasPending = fileHasPendingRequest(identifier, id) or fileHasPendingRequest(id, identifier)
                }
            end
        end
    end

    table.sort(filtered, function(a, b)
        return a.displayName < b.displayName
    end)

    local total = #filtered
    local totalPages = math.max(1, math.ceil(total / pageSize))
    local startIndex = (page - 1) * pageSize + 1
    local finish = math.min(total, startIndex + pageSize - 1)

    local users = {}
    for i = startIndex, finish do
        if filtered[i] then
            users[#users + 1] = filtered[i]
        end
    end

    return {
        users = users,
        page = page,
        pageSize = pageSize,
        total = total,
        totalPages = totalPages
    }
end

local function fileCreateStory(identifier, caption, mediaUrl)
    State.stories[#State.stories + 1] = {
        id = tostring(State.nextStoryId),
        owner = identifier,
        caption = caption,
        mediaUrl = mediaUrl,
        postedAt = nowTimeString()
    }
    State.nextStoryId = State.nextStoryId + 1
    saveState()
end

local function fileListStories(identifier)
    local user = State.users[identifier]
    local stories = {}

    for i = #State.stories, 1, -1 do
        local story = State.stories[i]
        local owner = State.users[story.owner]
        if owner then
            local isFriend = false
            if user then
                for _, f in ipairs(user.friends or {}) do
                    if f == story.owner then
                        isFriend = true
                        break
                    end
                end
            end

            if story.owner == identifier or isFriend then
                stories[#stories + 1] = {
                    id = story.id,
                    friendId = story.owner,
                    name = owner.displayName,
                    avatar = owner.avatar,
                    mediaLabel = story.caption,
                    postedAt = story.postedAt,
                    viewed = false
                }
            end
        end

        if #stories >= 30 then
            break
        end
    end

    return stories
end

local function ensureAccount(source)
    local identifier = getIdentifier(source)

    if UsingDatabase then
        return identifier, dbGetUserByIdentifier(identifier)
    end

    return identifier, fileGetUserByIdentifier(identifier)
end

local function listConversationsFor(identifier)
    if UsingDatabase then
        return dbListConversations(identifier)
    end

    return fileListConversations(identifier)
end

local function listMessagesFor(identifier, chatId, page, pageSize)
    if UsingDatabase then
        return dbListMessages(identifier, chatId, page, pageSize)
    end

    return fileListMessages(identifier, chatId, page, pageSize)
end

local function handleAction(source, action, payload)
    local identifier, user = ensureAccount(source)
    payload = payload or {}

    if action == "bootstrap" then
        local conversations = listConversationsFor(identifier)
        local activeChatId = conversations[1] and conversations[1].id or nil

        local friends = UsingDatabase and (user and dbListFriends(identifier) or {}) or (user and fileListFriends(identifier) or {})
        local stories = UsingDatabase and (user and dbListStoriesFor(identifier) or {}) or (user and fileListStories(identifier) or {})
        local requests = UsingDatabase and (user and dbListFriendRequests(identifier) or {}) or (user and fileListFriendRequests(identifier) or {})
        local messages = activeChatId and listMessagesFor(identifier, activeChatId, 1, 40) or {}

        return true, {
            account = publicAccount(user, identifier),
            friends = friends,
            stories = stories,
            conversations = conversations,
            messages = messages,
            friendRequests = requests
        }
    end

    if action == "registerAccount" then
        local username = normalizeUsername(payload.username)
        local displayName = (payload.displayName or ""):sub(1, 32)
        local password = tostring(payload.password or "")

        if username == "" or #username < 3 then
            return false, nil, "Pseudo invalide"
        end
        if displayName == "" then
            return false, nil, "Nom d'affichage invalide"
        end
        if #password < 4 then
            return false, nil, "Mot de passe trop court"
        end

        local passwordHash = hashPassword(password)

        if UsingDatabase then
            local existing, existingIdentifier = dbFindUserByUsername(username)
            if existing and existingIdentifier ~= identifier then
                return false, nil, "Pseudo deja utilise"
            end

            local saved = dbRegisterUser(identifier, username, displayName, user and user.bio or "", passwordHash)
            return true, {
                account = publicAccount(saved, identifier),
                friends = dbListFriends(identifier)
            }
        end

        local existing, existingIdentifier = fileFindUserByUsername(username)
        if existing and existingIdentifier ~= identifier then
            return false, nil, "Pseudo deja utilise"
        end

        State.users[identifier] = {
            username = username,
            displayName = displayName,
            bio = user and user.bio or "",
            passwordHash = passwordHash,
            avatar = makeAvatar(displayName),
            friends = user and user.friends or {}
        }
        saveState()

        return true, {
            account = publicAccount(State.users[identifier], identifier),
            friends = fileListFriends(identifier)
        }
    end

    if action == "updateProfile" then
        if not user then
            return false, nil, "Compte introuvable"
        end

        local displayName = (payload.displayName or user.displayName):sub(1, 32)
        local bio = (payload.bio or ""):sub(1, 120)

        if displayName == "" then
            return false, nil, "Nom d'affichage invalide"
        end

        if UsingDatabase then
            local saved = dbSaveUser(identifier, user.username, displayName, bio)
            return true, { account = publicAccount(saved, identifier) }
        end

        user.displayName = displayName
        user.bio = bio
        user.avatar = makeAvatar(displayName)
        saveState()

        return true, { account = publicAccount(user, identifier) }
    end

    if action == "searchUsers" then
        if not user then
            return false, nil, "Cree ton compte d'abord"
        end

        local query = tostring(payload.query or "")
        local page = tonumber(payload.page) or 1
        local pageSize = tonumber(payload.pageSize) or 10

        local result = UsingDatabase and dbSearchUsers(identifier, query, page, pageSize) or fileSearchUsers(identifier, query, page, pageSize)
        return true, result
    end

    if action == "sendFriendRequest" or action == "addFriend" then
        if not user then
            return false, nil, "Cree ton compte d'abord"
        end

        local username = normalizeUsername(payload.username)
        if username == "" then
            return false, nil, "Pseudo invalide"
        end

        if UsingDatabase then
            local targetUser, targetIdentifier = dbFindUserByUsername(username)
            if not targetUser then
                return false, nil, "Utilisateur introuvable"
            end
            if targetIdentifier == identifier then
                return false, nil, "Impossible de t'ajouter"
            end
            if dbAreFriends(identifier, targetIdentifier) then
                return true, { friends = dbListFriends(identifier) }
            end

            dbCreateFriendRequest(identifier, targetIdentifier)
            return true, {
                friends = dbListFriends(identifier),
                friendRequests = dbListFriendRequests(identifier)
            }
        end

        local targetUser, targetIdentifier = fileFindUserByUsername(username)
        if not targetUser then
            return false, nil, "Utilisateur introuvable"
        end
        if targetIdentifier == identifier then
            return false, nil, "Impossible de t'ajouter"
        end
        if fileAreFriends(identifier, targetIdentifier) then
            return true, { friends = fileListFriends(identifier) }
        end

        fileCreateFriendRequest(identifier, targetIdentifier)
        return true, {
            friends = fileListFriends(identifier),
            friendRequests = fileListFriendRequests(identifier)
        }
    end

    if action == "listFriendRequests" then
        if not user then
            return true, { friendRequests = {} }
        end

        return true, {
            friendRequests = UsingDatabase and dbListFriendRequests(identifier) or fileListFriendRequests(identifier)
        }
    end

    if action == "respondFriendRequest" then
        if not user then
            return false, nil, "Cree ton compte d'abord"
        end

        local requestId = payload.requestId
        local accept = payload.accept == true

        local ok
        if UsingDatabase then
            ok = dbRespondFriendRequest(requestId, identifier, accept)
        else
            ok = fileRespondFriendRequest(requestId, identifier, accept)
        end

        if not ok then
            return false, nil, "Demande introuvable"
        end

        return true, {
            friends = UsingDatabase and dbListFriends(identifier) or fileListFriends(identifier),
            friendRequests = UsingDatabase and dbListFriendRequests(identifier) or fileListFriendRequests(identifier)
        }
    end

    if action == "listFriends" then
        if not user then
            return true, { friends = {} }
        end

        return true, { friends = UsingDatabase and dbListFriends(identifier) or fileListFriends(identifier) }
    end

    if action == "listConversations" then
        if not user then
            return true, { conversations = [] }
        end

        return true, { conversations = listConversationsFor(identifier) }
    end

    if action == "openChat" or action == "listMessages" then
        if not user then
            return false, nil, "Cree ton compte d'abord"
        end

        local chatId = tostring(payload.chatId or "")
        if chatId == "" then
            return false, nil, "Chat invalide"
        end

        return true, {
            messages = listMessagesFor(identifier, chatId, payload.page or 1, payload.pageSize or 40),
            conversations = listConversationsFor(identifier)
        }
    end

    if action == "sendMessage" or action == "sendSnap" then
        if not user then
            return false, nil, "Cree ton compte d'abord"
        end

        local chatId = tostring(payload.chatId or "")
        if chatId == "" then
            return false, nil, "Chat invalide"
        end

        local content
        local messageType
        if action == "sendSnap" then
            messageType = "snap"
            content = "Snap envoye"
        else
            messageType = "text"
            content = tostring(payload.text or payload.content or "")
        end

        content = content:sub(1, 512)
        if content == "" then
            return false, nil, "Message vide"
        end

        if UsingDatabase then
            local friendId = dbResolveConversationFriend(chatId, identifier)
            if not friendId then
                return false, nil, "Conversation introuvable"
            end

            dbInsertMessage(chatId, identifier, messageType, content, payload.mediaUrl)
        else
            local friendId = fileResolveConversationFriend(chatId, identifier)
            if not friendId then
                return false, nil, "Conversation introuvable"
            end

            fileInsertMessage(chatId, identifier, messageType, content, payload.mediaUrl)
        end

        return true, {
            messages = listMessagesFor(identifier, chatId, 1, 40),
            conversations = listConversationsFor(identifier)
        }
    end

    if action == "captureStory" then
        if not user then
            return false, nil, "Cree ton compte d'abord"
        end

        local caption = (payload.caption or "Story SnipChat"):sub(1, 80)
        if UsingDatabase then
            dbCreateStory(identifier, caption, payload.mediaUrl)
            return true, { stories = dbListStoriesFor(identifier) }
        end

        fileCreateStory(identifier, caption, payload.mediaUrl)
        return true, { stories = fileListStories(identifier) }
    end

    if action == "navigate" then
        return true, {}
    end

    return false, nil, "Action inconnue"
end

RegisterNetEvent("snipchat:request", function(requestId, action, payload)
    local src = source

    local ok, success, data, err = pcall(handleAction, src, action, payload)
    if not ok then
        TriggerClientEvent("snipchat:response", src, requestId, false, nil, "Erreur serveur")
        return
    end

    TriggerClientEvent("snipchat:response", src, requestId, success, data, err)
end)

CreateThread(function()
    local oxState = GetResourceState("oxmysql")
    if oxState == "started" and setupDatabase() then
        UsingDatabase = true
        print("[SnipChat] Backend SQL actif (oxmysql).")
    else
        loadState()
        print("[SnipChat] Backend fichier actif (fallback).")
    end
end)
