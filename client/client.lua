while GetResourceState("lb-phone") ~= "started" do
    Wait(500)
end

Wait(1000)

local url = GetResourceMetadata(GetCurrentResourceName(), "ui_page", 0)
local pendingRequests = {}
local requestCounter = 0

local function AddApp()
    local added, errorMessage = exports["lb-phone"]:AddCustomApp({
        identifier = Config.Identifier,
        name = Config.Name,
        description = Config.Description,
        developer = Config.Developer,
        defaultApp = Config.DefaultApp,
        size = 59812,
        images = {
            "https://cfx-nui-" .. GetCurrentResourceName() .. "/ui/dist/screenshot-light.png",
            "https://cfx-nui-" .. GetCurrentResourceName() .. "/ui/dist/screenshot-dark.png"
        },
        ui = url:find("http") and url or GetCurrentResourceName() .. "/" .. url,
        icon = url:find("http") and url .. "/public/icon.svg" or "https://cfx-nui-" .. GetCurrentResourceName() .. "/ui/dist/icon.svg",
        fixBlur = true,
        onClose = function()
            exports["lb-phone"]:DisableWalkableCam()
        end
    })

    if not added then
        print("Could not add app:", errorMessage)
    end
end

AddApp()

AddEventHandler("onResourceStart", function(resource)
    if resource == "lb-phone" then
        AddApp()
    end
end)

RegisterNetEvent("snipchat:response", function(requestId, ok, data, err)
    local resolver = pendingRequests[requestId]
    if not resolver then
        return
    end

    pendingRequests[requestId] = nil
    resolver:resolve({
        ok = ok,
        data = data,
        error = err
    })
end)

local function AwaitServer(action, payload)
    requestCounter = requestCounter + 1
    local requestId = tostring(requestCounter)
    local p = promise.new()

    pendingRequests[requestId] = p

    SetTimeout(8000, function()
        local resolver = pendingRequests[requestId]
        if not resolver then
            return
        end

        pendingRequests[requestId] = nil
        resolver:resolve({
            ok = false,
            error = "timeout"
        })
    end)

    TriggerServerEvent("snipchat:request", requestId, action, payload or {})

    return Citizen.Await(p)
end

local function payloadOf(data)
    if type(data) == "table" and data.payload then
        return data.payload
    end

    return data or {}
end

local function RegisterServerAction(name)
    RegisterNUICallback(name, function(data, cb)
        local result = AwaitServer(name, payloadOf(data))
        cb(result)
    end)
end

RegisterNUICallback("toggleCamera", function(data, cb)
    local payload = payloadOf(data)
    local enabled = false

    if type(payload) == "table" then
        enabled = payload.enabled == true
    elseif type(payload) == "boolean" then
        enabled = payload
    end

    if enabled then
        exports["lb-phone"]:EnableWalkableCam()
    else
        exports["lb-phone"]:DisableWalkableCam()
    end

    cb({ ok = true })
end)

RegisterNUICallback("drawNotification", function(data, cb)
    local payload = payloadOf(data)

    BeginTextCommandThefeedPost("STRING")
    AddTextComponentSubstringPlayerName(payload.message or "SnipChat")
    EndTextCommandThefeedPostTicker(false, false)

    cb({ ok = true })
end)

RegisterServerAction("bootstrap")
RegisterServerAction("registerAccount")
RegisterServerAction("updateProfile")
RegisterServerAction("addFriend")
RegisterServerAction("listFriends")
RegisterServerAction("captureStory")
RegisterServerAction("sendMessage")
RegisterServerAction("sendSnap")
RegisterServerAction("openChat")
RegisterServerAction("navigate")
