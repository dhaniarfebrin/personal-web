---
title: "From React Web to React Native: The Culture Shock"
description: "My first experience building a mobile app as a frontend web developer and the unexpected challenges I faced along the way."
publishedAt: 2024-05-15
image: "/images/blog-mobile-dev.jpg"
tags: ["react native", "mobile development", "career", "culture shock"]
---

## The Illusion of "It's Just React"

As a frontend web developer heavily invested in the React ecosystem, making the jump to mobile development felt like a natural progression. When I started building my first mobile project, [Waifu Search](/projects/waifu-search) (an infinite-scrolling image discovery app), I thought, *"Hey, it's React Native. It has 'React' in the name. How hard could it be?"*

The answer? Harder—and certainly much more different—than I anticipated.

While the core principles of components, state, and props remain exactly the same, the environment surrounding them is a completely different beast. Here are the biggest "culture shocks" I experienced transitioning from web to mobile development.

## 1. The Environment Setup is a Test of Patience

In web development, starting a new project usually involves running `npm create vite@latest`, waiting 30 seconds, and you are ready to code. 

In React Native (specifically with the CLI), the setup is a multi-step hurdle. I develop on a Mac, and getting the environment ready meant dealing with:
- Installing and configuring Xcode (which takes hours).
- Setting up CocoaPods and navigating Ruby dependencies for iOS.
- Installing Android Studio, configuring the Android SDK, and setting up environment variables.

It’s not just a quick `npm install`; it's configuring two entirely separate native ecosystems to talk to your JavaScript code.

## 2. "Why is Everything So Huge?!"

Coming from the web, where a heavy `node_modules` folder is an ongoing joke, I was not prepared for the sheer size of mobile development tools.

Xcode is massive (often taking up 10GB+ just for the app, plus simulators). Android Studio and its various SDK versions, emulator images, and build tools easily swallowed another 20-30GB of my hard drive. Suddenly, my storage space was vanishing just to get a "Hello World" app running.

## 3. The Hardware Toll

Web development is incredibly lightweight. You can build a robust web app on a mid-range laptop without breaking a sweat.

Mobile development, however, demands resources. Running VS Code, the Metro bundler terminal, an iOS Simulator, and an Android Emulator simultaneously requires serious RAM and CPU power. My machine was practically taking off like a jet engine during the initial build phases. If you want a smooth development experience, high specifications aren't just nice to have; they are almost mandatory.

## 4. Styling: Familiar yet Foreign

In web development, we are used to the DOM and CSS. Need something to take up the full screen? `height: 100vh; width: 100vw;`. Need a container? Use a `<div>`.

React Native throws that out the window. There is no DOM. `<div>` becomes `<View>`, and `<p>` or `<span>` becomes `<Text>`. Furthermore, all text *must* be wrapped in a `<Text>` component, or your app will crash.

```javascript
// Web (React)
const Card = () => (
  <div className="flex flex-col h-screen w-full">
    <span>Hello Web!</span>
  </div>
);

// Mobile (React Native)
const Card = () => (
  // Flexbox defaults to flexDirection: 'column' in React Native!
  // No vh/vw available directly without getting window dimensions
  <View style={{ flex: 1 }}> 
    <Text>Hello Mobile!</Text>
  </View>
);
```

While I used NativeWind (Tailwind for React Native) to bridge the gap, learning how Flexbox behaves slightly differently (defaulting to `column` instead of `row`) and handling screen dimensions dynamically without `vh`/`vw` was a significant adjustment.

## 5. Routing: URLs vs. Stacks

On the web, routing is conceptually simple: a user goes to a specific URL (like `/about`), and the router renders the corresponding component. 

In mobile, there are no URLs. Navigation is based on "Stacks" and "Tabs" (usually via React Navigation). Instead of linking to a URL, you push a new screen onto a stack of screens. 

```javascript
// Web: Linking to a route
<Link to="/details/1">Go to Details</Link>

// Mobile: Pushing to a stack
<Button 
  title="Go to Details" 
  onPress={() => navigation.navigate('Details', { id: 1 })} 
/>
```

But it doesn't stop there. In a strongly-typed TypeScript environment, React Navigation requires you to explicitly define types for your routes and the props they receive. When you navigate to a screen, that destination screen needs to specify its navigation prop type to know exactly what parameters it expects to receive.

```typescript
// Mobile: Strongly typing the destination screen
type RootStackParamList = {
  Home: undefined;
  Details: { id: number }; // Defining what params 'Details' expects
};

// Type for the Screen Props
type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen = ({ route, navigation }: DetailsScreenProps) => {
  const { id } = route.params; // TypeScript now knows 'id' is a number
  return <Text>Details for ID: {id}</Text>;
};
```

Understanding how to strongly type the navigation, pass parameters between screens, and manage the navigation history (the stack) required completely rewiring how I thought about user flow compared to web routing.

## 6. The Deployment Nightmare

Deploying a web app today is magical. You push to a GitHub repository, Vercel or Netlify picks it up, and 30 seconds later, your site is live globally.

Deploying a mobile app is an ordeal. You have to deal with:
- Provisioning profiles and signing certificates.
- Generating `.ipa` (iOS) or `.aab` (Android) files.
- Dealing with Xcode build configurations.
- Submitting to the App Store and Google Play Store, which involves a lengthy review process where your app can be rejected for arbitrary reasons.

There is no "push and forget."

## Conclusion

Despite the steep learning curve, the heavy tools, and the deployment headaches, building the Waifu Search app was incredibly rewarding. Seeing JavaScript code compile into a truly native application that performs smoothly with 60FPS masonry lists (thanks to Shopify's FlashList) is a fantastic feeling.

If you are a web developer looking to jump into mobile, be prepared for the culture shock. The environment is harsher, but the principles you know still apply. Bring a lot of patience, clear out your hard drive, and get ready to learn!
