--- start quick open applications
function open_app(names)
    return function()
        for k, name in pairs(names) do
            if hs.application.launchOrFocus(name) then
                return
            end
        end
    end
end

-- Hammerspoon will try to open applications with same order passed in as argument
-- If Microsoft Teams is opened then Spotify app will not open
-- and if Microsoft Teams is not found then Spotify will be opened so on and so forth
hs.hotkey.bind({ "cmd", "shift" }, "T", open_app({ "iTerm" }))
hs.hotkey.bind({ "cmd", "shift" }, "S", open_app({ "Slack" }))
hs.hotkey.bind({ "cmd", "shift" }, "D", open_app({ "Discord" }))
hs.hotkey.bind({ "cmd", "shift" }, "W", open_app({ "Webstorm" }))
hs.hotkey.bind({ "cmd", "shift" }, "P", open_app({ "Postman" }))

hs.hotkey.bind(
    { "cmd", "shift" },
    "M",
    open_app({ "Microsoft Teams", "Spotify" })
)
hs.hotkey.bind(
    { "cmd", "shift" },
    "O",
    open_app({ "Microsoft Outlook", "Mail" })
)
hs.hotkey.bind(
    { "cmd", "shift" },
    "B",
    open_app({ "Google Chrome", "Brave Browser" })
)
