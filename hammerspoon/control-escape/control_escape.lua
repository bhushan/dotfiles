local send_escape = false
local last_mods = {}

local control_key_handler = function()
  send_escape = false
end

local DELAY_IN_SECONDS = 0.15
local control_key_timer = hs.timer.delayed.new(DELAY_IN_SECONDS, control_key_handler)

local control_handler = function(evt)
  local new_mods = evt:getFlags()
  if last_mods["ctrl"] == new_mods["ctrl"] then
    return false
  end
  if not last_mods["ctrl"] then
    last_mods = new_mods
    send_escape = true
    control_key_timer:start()
  else
    if send_escape then
      hs.eventtap.keyStroke({}, "ESCAPE")
    end
    last_mods = new_mods
    control_key_timer:stop()
  end
  return false
end

local control_tap = hs.eventtap.new({ hs.eventtap.event.types.flagsChanged }, control_handler)
control_tap:start()

local other_handler = function(evt)
  send_escape = false
  return false
end

local other_tap = hs.eventtap.new({ hs.eventtap.event.types.keyDown }, other_handler)
other_tap:start()
