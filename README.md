# Habits Trainer

Sample React Native (Expo) app for building iPhone apps.

This starter includes a simple habits checklist UI you can run on an iPhone with the Expo Go app, or build as a native iOS app.

## Requirements

- Node.js 20+
- Expo Go on your iPhone (for quick testing), or a Mac with Xcode for native iOS builds

## Getting started

```bash
npm install
npm start
```

Then:

1. Open the Expo Go app on your iPhone
2. Scan the QR code from the terminal
3. Edit `App.tsx` and see live updates

### Run specifically for iOS

```bash
npm run ios
```

On a Mac with Xcode installed, this can open the iOS Simulator. On other machines, use Expo Go on a physical iPhone.

## Project structure

- `App.tsx` – main sample screen (habits list + progress)
- `app.json` – Expo / iOS app configuration
- `index.ts` – app entry point
- `assets/` – app icons and splash images

## Next steps

- Replace the sample habits UI with your own screens
- Add navigation with React Navigation
- Persist habits with AsyncStorage or a backend
- Create a production iOS build with [EAS Build](https://docs.expo.dev/build/introduction/)
