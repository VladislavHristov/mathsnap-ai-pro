# MathSnap AI Pro — Project TODO

## Phase 1: Project Setup & Branding
- [x] Generate custom app logo and update branding
- [x] Update app.config.ts with app name and logo URL
- [x] Configure theme colors in theme.config.js

## Phase 2: Backend API Services
- [x] Set up backend project structure (services folder)
- [x] Implement TinyOCR service (extract LaTeX from images)
- [x] Implement OpenAI classification service (problem type, difficulty, requires_graph, requires_symbolic_solver)
- [x] Implement Wolfram Alpha solver service (for symbolic/complex math)
- [x] Implement OpenAI solver service (for general math and explanations)
- [x] Implement classifier service (decision engine)
- [x] Create /solve endpoint (main API route)
- [x] Create /classify endpoint
- [x] Create /graph endpoint
- [x] Set up environment variables (TINYOCR_API_KEY, OPENAI_API_KEY, WOLFRAM_APP_ID)
- [x] Add error handling and validation

## Phase 3: Mobile App UI Screens
- [x] Create Home Screen with quick actions and recent problems
- [x] Create Camera Screen with photo capture and upload
- [x] Create Processing Screen (image to backend)
- [x] Create Solution Steps Screen (step-by-step explanation in Bulgarian)
- [x] Create History Screen (list of solved problems)
- [x] Create Favorites Screen (saved problems)
- [x] Create Settings Screen (dark mode, language, cache clear)
- [x] Set up tab navigation structure

## Phase 4: Mobile App Integration
- [x] Connect Camera Screen to backend /solve endpoint
- [x] Implement image upload and processing
- [x] Display extracted problem on Problem Detail Screen
- [x] Display classification badge and difficulty
- [x] Display solution steps in Bulgarian
- [x] Add loading states and error handling

## Phase 5: Data Persistence & Features
- [x] Implement local storage for problem history (AsyncStorage)
- [x] Implement favorites system
- [x] Implement dark mode toggle
- [x] Add language selection (Bulgarian/English)
- [x] Implement cache clearing

## Phase 6: Polish & Optimization
- [x] Add haptic feedback to interactions
- [x] Implement smooth transitions and animations
- [x] Optimize image compression before upload
- [x] Add pull-to-refresh on History Screen
- [x] Implement search/filter on History Screen
- [x] Test end-to-end user flows
- [x] Verify Bulgarian language output
- [x] Test on iOS and Android (Expo Go)

## Phase 7: Testing & Deployment
- [ ] Write unit tests for backend services
- [ ] Write integration tests for API endpoints
- [ ] Test with real Mathpix, OpenAI, and Wolfram Alpha APIs
- [ ] Verify graph rendering accuracy
- [ ] Test dark mode across all screens
- [ ] Create checkpoint and prepare for publish


## Bugs & Fixes
- [x] Fix upload image button on Home Screen
- [x] Fix TinyOCR API error - replaced with Google Vision API
- [x] Integrate Google Vision API for OCR
- [x] Enable billing on Google Cloud project
- [x] Update OpenAI solver with improved prompt format for structured solutions
- [x] Fix React child error in ScreenContainer - objects not valid as React children
- [x] Fix image picker error on Android - added permissions and error handling
- [x] Fix APK build error - updated compileSdkVersion to 36
- [x] Fix expo-image-picker Kotlin error - downgraded to version 14.1.1 compatible with Expo 54
- [x] Fix Gradle build error - added Kotlin version and build properties
- [x] Fix Kotlin version error - updated to Kotlin 2.0.0
- [x] Remove expo-camera (incompatible with build) and use expo-image-picker for both camera and gallery
- [x] Fix expo-image-loader Gradle build error - upgraded expo-image-picker to ~17.0.10 (SDK 54 compatible)
- [x] Fix app freezing when uploading/capturing images - optimize image pipeline
- [x] Stop passing large base64 through route params (uses module-level cache)
- [x] Use module-level cache instead of route params for image transfer
- [x] Compress images before processing (resize to 1024px, 60% JPEG quality)
- [x] Create README.md file with Bulgarian description and features
- [x] Add image cropping feature after camera/upload - users can preview and confirm before processing
- [x] Fix crop screen - replaced FileReader with React Native file handling

## OpenAI Integration (Performance Upgrade)
- [x] Replace Forge/Gemini with direct OpenAI API
- [x] Update classifier service to use OpenAI (GPT-4o)
- [x] Update solver service to use OpenAI (GPT-4o)
- [x] Set OPENAI_API_KEY environment variable
- [x] Test classification performance
- [x] Test solving performance
- [x] Compare results quality with previous implementation

## Polynomial Accuracy Fix (April 23, 2026)
- [x] Enhanced OpenAI solver prompt with polynomial-specific instructions
- [x] Added biquadratic equation handling (y = x² substitution)
- [x] Updated classifier to mark all degree >= 3 polynomials as requiring symbolic solver
- [x] Implemented polynomial detection in solver service (forces Wolfram Alpha)
- [x] Created comprehensive test for x⁴ - 10x² + 9 = 0 polynomial
- [x] Verified solution accuracy: x = 3, x = -3, x = 1, x = -1 ✓
- [x] All steps include verification by substitution back into original equation
- [x] Bulgarian language output with clear step-by-step explanations
