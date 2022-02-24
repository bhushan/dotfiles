--- start quick open applications
function open_app(name)
    return function()
        hs.application.launchOrFocus(name)
    end
end

--- quick open applications
hs.hotkey.bind({"alt", "shift"}, "C", open_app("Visual Studio Code"))
hs.hotkey.bind({"alt", "shift"}, "W", open_app("Webstorm"))
hs.hotkey.bind({"alt", "shift"}, "B", open_app("Brave Browser"))
hs.hotkey.bind({"alt", "shift"}, "T", open_app("iTerm"))
hs.hotkey.bind({"alt", "shift"}, "S", open_app("Slack"))
hs.hotkey.bind({"alt", "shift"}, "D", open_app("Discord"))
