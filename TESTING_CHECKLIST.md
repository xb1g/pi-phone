# Pi Phone UI - Testing Checklist

## 🧪 Complete Testing Guide

Use this checklist to verify all new features work correctly.

---

## ✅ Visual Design Tests

### Theme System
- [ ] Dark theme displays correctly by default
- [ ] Light theme displays when toggled
- [ ] Theme toggle button visible (top-right corner)
- [ ] Theme toggle button shows correct icon (☀️/🌙)
- [ ] Theme persists after page refresh
- [ ] System theme change detected (if no manual override)
- [ ] Alt+T keyboard shortcut works
- [ ] Smooth transition between themes

### Colors & Styling
- [ ] Gradient backgrounds visible
- [ ] Accent color (#7fd4ff) used consistently
- [ ] Text readable in both themes
- [ ] Code blocks styled correctly
- [ ] Buttons have hover states
- [ ] Icons display correctly

### Animations
- [ ] Message entrance animation smooth
- [ ] Modal slide-up animation works
- [ ] Toast fade-in/out works
- [ ] Streaming pulse animation visible
- [ ] No janky animations on scroll
- [ ] Animations respect reduced motion preference

---

## ✅ Mobile UX Tests

### Touch Interactions
- [ ] All buttons minimum 44px touch target
- [ ] No accidental double-tap zoom
- [ ] Scroll smooth and responsive
- [ ] Horizontal scroll on action chips works
- [ ] Attachment strip scrollable
- [ ] Command strip scrollable
- [ ] Text input focuses correctly
- [ ] Keyboard doesn't cover input

### Safe Areas
- [ ] Top safe area respected (notch)
- [ ] Bottom safe area respected (home indicator)
- [ ] Content not cut off on notched phones
- [ ] Composer doesn't overlap with home indicator
- [ ] Theme toggle accessible on all devices

### Haptic Feedback
- [ ] Theme toggle triggers vibration
- [ ] Error toasts trigger vibration
- [ ] Success toasts trigger vibration
- [ ] Vibration not too strong/long
- [ ] Respects system haptic settings

---

## ✅ Accessibility Tests

### Screen Reader (VoiceOver/TalkBack)
- [ ] All buttons have accessible labels
- [ ] Messages announced correctly
- [ ] Connection status announced
- [ ] Streaming status announced
- [ ] Modal opening/closing announced
- [ ] Toast notifications announced
- [ ] Form inputs have labels
- [ ] Images have alt text (or aria-hidden)

### Keyboard Navigation
- [ ] Tab moves focus logically
- [ ] All interactive elements focusable
- [ ] Focus visible indicator clear
- [ ] Escape closes modals
- [ ] Enter sends message
- [ ] Alt+T toggles theme
- [ ] No keyboard traps
- [ ] Focus trapped in modals when open

### Visual Accessibility
- [ ] Text meets contrast requirements (4.5:1)
- [ ] Focus indicators visible
- [ ] Color not sole indicator of meaning
- [ ] Text resizable to 200% without breaking
- [ ] High contrast mode works
- [ ] Reduced motion respected

---

## ✅ PWA Tests

### Installation
- [ ] "Add to Home Screen" prompt appears
- [ ] App installs successfully
- [ ] App icon displays correctly
- [ ] App opens in standalone mode
- [ ] No browser chrome visible
- [ ] Splash screen shows (if configured)

### Offline Support
- [ ] App loads once while online
- [ ] App loads when offline (cached)
- [ ] Static assets cached
- [ ] Service worker registered
- [ ] Service worker updates correctly
- [ ] Offline fallback works

### App Shortcuts
- [ ] Long-press app icon shows shortcuts
- [ ] "New Session" shortcut works
- [ ] "Sessions" shortcut works
- [ ] Shortcuts open correct URLs

### Share Target
- [ ] Share menu shows Pi Phone
- [ ] Sharing text works
- [ ] Sharing images works
- [ ] Shared content appears in composer

---

## ✅ Functional Tests

### Core Features
- [ ] Connect to Pi server
- [ ] Send messages
- [ ] Receive responses
- [ ] Attach images
- [ ] View attached images
- [ ] Remove attachments
- [ ] Abort streaming
- [ ] Connection status updates

### Status Card
- [ ] Working directory displays
- [ ] Session name displays
- [ ] Model name displays
- [ ] Thinking level displays
- [ ] State (Idle/Streaming) displays
- [ ] Server address displays
- [ ] Actions button works
- [ ] Refresh button works
- [ ] Tree button works
- [ ] Abort button works

### Composer
- [ ] Text input auto-resizes
- [ ] Send button visible
- [ ] Stop button appears when streaming
- [ ] Attach button opens file picker
- [ ] Command chip strip scrolls
- [ ] Action chips scroll
- [ ] Quota display updates
- [ ] Focus states visible

### Messages
- [ ] User messages styled differently
- [ ] Assistant messages styled correctly
- [ ] Tool calls collapsible
- [ ] Code blocks formatted
- [ ] Links clickable
- [ ] Markdown rendered
- [ ] Images display inline
- [ ] Timestamps visible (if applicable)

### Modals
- [ ] Login modal appears when needed
- [ ] Token input works
- [ ] UI modal appears for prompts
- [ ] Sheet modal (control center) works
- [ ] Close buttons work
- [ ] Escape key closes modals
- [ ] Modal animations smooth

### Notifications
- [ ] Toast notifications appear
- [ ] Toast notifications auto-dismiss
- [ ] Error toasts styled red
- [ ] Success toasts styled green
- [ ] Warning toasts styled yellow
- [ ] Multiple toasts stack
- [ ] Toasts don't block interaction

---

## ✅ Performance Tests

### Loading
- [ ] Initial page load < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] No layout shift (CLS < 0.1)
- [ ] Loading overlay appears when needed
- [ ] Loading overlay disappears correctly

### Runtime
- [ ] Scroll smooth (60fps)
- [ ] No memory leaks (check DevTools)
- [ ] No console errors
- [ ] No console warnings
- [ ] WebSocket reconnects on disconnect
- [ ] No duplicate event listeners

### Network
- [ ] Service worker caches assets
- [ ] API calls use network-first
- [ ] Static assets use cache-first
- [ ] Offline mode works
- [ ] Reconnection works after offline

---

## ✅ Browser Compatibility Tests

### iOS Safari
- [ ] iPhone (latest iOS)
- [ ] iPad (latest iPadOS)
- [ ] Safe areas respected
- [ ] No viewport issues
- [ ] Touch events work
- [ ] PWA installs

### Android Chrome
- [ ] Phone (latest Android)
- [ ] Tablet (latest Android)
- [ ] Safe areas respected
- [ ] Touch events work
- [ ] PWA installs
- [ ] Share target works

### Desktop Browsers (Responsive)
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Responsive at all breakpoints
- [ ] Keyboard shortcuts work

---

## ✅ Edge Cases

### Network
- [ ] Slow 3G connection
- [ ] Intermittent connection
- [ ] Complete offline
- [ ] Reconnection after offline
- [ ] WebSocket disconnect

### Content
- [ ] Very long messages
- [ ] Very long code blocks
- [ ] Many attachments
- [ ] Many messages (scrolling)
- [ ] Special characters in input
- [ ] Emoji in messages

### User Behavior
- [ ] Rapid theme toggling
- [ ] Multiple modal opens
- [ ] Quick send/stop
- [ ] Back button during streaming
- [ ] Multiple tabs open
- [ ] Browser refresh during streaming

---

## ✅ Regression Tests

### Existing Features
- [ ] Pi RPC connection works
- [ ] Session management works
- [ ] Model switching works
- [ ] Thinking level switching works
- [ ] Commands work
- [ ] Skills work
- [ ] Prompts work
- [ ] Tree browser works
- [ ] Stats display works
- [ ] Cost display works

---

## 📊 Test Results Template

```markdown
## Test Session

**Date**: YYYY-MM-DD  
**Device**: [Device model]  
**OS**: [OS version]  
**Browser**: [Browser version]  

### Results
- Passed: XX/XX
- Failed: XX/XX
- Skipped: XX/XX

### Issues Found
1. [Issue description]
   - Severity: [Critical/Major/Minor]
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

### Notes
[Any additional observations]
```

---

## 🐛 Reporting Issues

When reporting bugs, include:

1. **Test environment**
   - Device model
   - OS version
   - Browser version
   
2. **Steps to reproduce**
   - Clear, numbered steps
   
3. **Expected behavior**
   - What should happen
   
4. **Actual behavior**
   - What actually happens
   
5. **Screenshots/recordings**
   - Visual evidence if helpful
   
6. **Console errors**
   - Any JavaScript errors
   
7. **Network errors**
   - Any failed requests

---

## ✅ Sign-off Checklist

Before releasing:

- [ ] All critical tests pass
- [ ] All major tests pass
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Performance acceptable
- [ ] Accessibility verified
- [ ] PWA features work
- [ ] Cross-browser tested
- [ ] Mobile tested on real devices
- [ ] Code reviewed
- [ ] Version bumped
- [ ] Changelog updated

---

**Testing is complete when all critical and major tests pass!** 🎉
