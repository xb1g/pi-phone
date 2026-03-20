# Pi Phone - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install

```bash
pi install npm:@malinamnam/pi-phone
```

Then reload Pi:
```text
/reload
```

### Step 2: Start Phone Server

Open Pi in your project directory:
```bash
cd /path/to/your/project
pi
```

Start the phone server:
```text
/phone-start
```

Pi will show you a URL like:
```
https://your-device.ts.net/
```

### Step 3: Open on Your Phone

1. Open the URL on your phone's browser
2. Enter the token if prompted (use `/phone-token` to see it)
3. Start chatting with Pi!

## 📱 Using the New UI

### Theme Toggle
- Tap the **☀️/🌙 button** in the top-right corner
- Or press **Alt+T** on keyboard
- Automatically follows your system theme

### Key Features

**Top Bar**
- Connection status (green = connected, red = offline)
- Streaming indicator (pulsing when active)

**Status Card**
- Working directory, session, model, thinking level
- Quick action buttons: Actions, Refresh, Tree, Abort

**Message Area**
- User messages (blue gradient, right-aligned)
- Assistant messages (dark, left-aligned)
- Tool calls (collapsible panels)
- Code blocks (syntax highlighted)

**Composer (Bottom)**
- Text input (auto-resizes)
- Attach image button (📎)
- Send button (➤)
- Stop button (■) when streaming
- Action chips: Commands, /cd, Sessions, Steer

**Quota Display**
- Context usage percentage
- Color-coded: green (good), yellow (warning), red (danger)
- Token quota for supported models

### Gestures & Interactions

- **Scroll**: Swipe up/down in messages
- **Horizontal scroll**: Swipe left/right on action chips
- **Pull to refresh**: Not yet implemented (coming soon)
- **Long press**: Not yet implemented (coming soon)

### Keyboard Shortcuts

- **Alt+T**: Toggle theme
- **Escape**: Close modals
- **Enter**: Send message (when not in textarea)
- **Ctrl+Enter**: Send message (from textarea)

## 🎨 Customization

### Change Theme Colors

Edit `styles.css` in the package directory:
```css
:root {
  --accent-primary: #7fd4ff;  /* Change accent color */
  --bg-primary: #071018;      /* Change background */
  /* ... more variables */
}
```

### Disable Token Auth

```text
/phone-start 8787 -
```

### Change Port

```text
/phone-start 9000
```

## 🔧 Troubleshooting

### Can't Connect from Phone

1. Make sure Tailscale is running:
   ```bash
   tailscale status
   ```

2. Check phone server status:
   ```text
   /phone-status
   ```

3. Restart if needed:
   ```text
   /phone-stop
   /phone-start
   ```

### Theme Not Saving

- Clear browser cache
- Check localStorage in browser dev tools
- Make sure cookies/local storage are enabled

### PWA Not Installing

- Use Chrome/Safari on mobile
- Make sure you're on HTTPS (Tailscale provides this)
- Try "Add to Home Screen" manually

### Offline Mode Not Working

- Visit the page once while online
- Service worker needs to cache assets first
- Check browser console for errors

## 📊 What You Can Do

### Basic Chat
- Send messages to Pi
- Get AI-powered coding help
- Ask questions about your code

### Session Management
- Start new sessions
- Switch between sessions
- Compact long sessions
- View session stats

### Code Operations
- Browse file tree
- Change working directory (`/cd`)
- View and run commands
- Use skills and prompts

### Model Settings
- Switch AI models
- Adjust thinking level
- View quota usage

## 💡 Pro Tips

1. **Add to Home Screen**: Install as PWA for native app experience
2. **Use Dark Mode**: Better battery life on OLED screens
3. **Keep Token Handy**: Save it in a password manager
4. **Monitor Quota**: Watch context usage on long sessions
5. **Compact Regularly**: Use compact to save tokens

## 🆘 Getting Help

- Check [README.md](./README.md) for full documentation
- See [UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md) for UI details
- Report issues on GitHub
- Check Pi docs for general Pi usage

---

**Happy coding from your phone! 📱✨**
