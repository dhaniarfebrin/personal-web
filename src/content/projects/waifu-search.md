---
title: "Waifu Search Mobile App"
description: "A visually pleasing React Native mobile application for discovering anime images with an infinite scrolling, Pinterest-style masonry layout."
featured: true
technologies: ["React Native", "TypeScript", "Tailwind CSS", "TanStack Query", "FlashList"]
liveUrl: ""
githubUrl: "https://github.com/dhaniarfebrin/waifu-search"
image: "/images/projects-waifu-search.jpg"
---

## Project Overview

Waifu Search is a mobile application built with React Native CLI that allows users to search, browse, and view anime images through an infinite scrolling interface. It consumes the public waifu.im API and is designed with an aesthetic Dark Theme featuring a Pinterest-style Masonry Layout.

## Goals

- Create a visually stunning and smooth mobile browsing experience
- Implement a performant masonry layout for dynamic image grids
- Handle complex state management and API rate limiting efficiently
- Showcase modern React Native architecture and styling with Tailwind CSS

## Architecture

### Technology Stack
- **React Native**: Core framework for building the native mobile app (New Architecture Enabled)
- **TypeScript**: For robust, type-safe development
- **TanStack Query**: For efficient data fetching, caching, and state management
- **NativeWind (Tailwind CSS)**: For utility-first styling directly in React Native
- **Shopify FlashList**: Highly performant list component for rendering the masonry grid

### Features

1. **Masonry Layout**: Dynamic image grid adapting to original image proportions without awkward empty spaces.
2. **Infinite Scrolling**: Seamless exploration of thousands of images with high-performance list rendering.
3. **Smart Skeleton Loading**: Uses the API's dominant color for placeholders, creating smooth visual transitions while images load.
4. **Advanced Filtering**: Filter by content rating (SFW/NSFW), orientation (Portrait/Landscape), and sort by various metrics.
5. **Detailed Metadata**: Full-screen image viewing with comprehensive tags, upload dates, original sources, and dimensions.

## Key Performance Optimizations

### Image Rendering & Caching
- Utilizes `react-native-fast-image` for aggressive image caching, ensuring smooth scrolling even with heavy visual content.

### List Rendering
- Powered by `@shopify/flash-list` v2 to maintain 60 FPS while rendering complex masonry grids during infinite scrolling.

### API Management
- Custom Axios interceptors to gracefully handle API rate limits (HTTP 429) with native alerts.

## Development Experience

Built leveraging modern React Native ecosystem tools:
- Strict TypeScript definitions for API responses (`waifu.ts`)
- Custom hooks (`useWaifuImages.ts`) abstracting complex TanStack infinite queries
- Clean component architecture separating UI components like `FilterModal` and `ImageCard` from screen logic

## Future Enhancements

Planned improvements:
- Image downloading and saving directly to the device gallery
- User authentication or local storage to save favorite images
- Enhanced share functionality to easily share images across other applications
