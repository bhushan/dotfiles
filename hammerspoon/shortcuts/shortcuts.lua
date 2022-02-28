--- start quick open applications
function open_app(name)
    return function()
        hs.application.launchOrFocus(name)
    end
end

--- quick open applications
hs.hotkey.bind({"cmd", "shift"}, "W", open_app("Webstorm"))
hs.hotkey.bind({"cmd", "shift"}, "B", open_app("Brave Browser"))
hs.hotkey.bind({"cmd", "shift"}, "G", open_app("Google Chrome"))
hs.hotkey.bind({"cmd", "shift"}, "M", open_app("Microsoft Teams"))
hs.hotkey.bind({"cmd", "shift"}, "O", open_app("Microsoft Outlook"))
hs.hotkey.bind({"cmd", "shift"}, "T", open_app("iTerm"))
hs.hotkey.bind({"cmd", "shift"}, "S", open_app("Slack"))
hs.hotkey.bind({"cmd", "shift"}, "D", open_app("Discord"))
