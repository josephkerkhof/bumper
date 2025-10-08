import {
	AbsoluteFill,
	Audio,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	staticFile,
	Easing,
	Sequence,
} from 'remotion';
import React from 'react';

const COLORS = {
	orange: '#f15e22',
	black: '#000000',
	white: '#ffffff',
};

export const IntroBumper: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Toggle between light and dark mode
	const lightMode = true; // Set to true for light mode, false for dark mode

	// Set colors based on mode
	const backgroundColor = lightMode ? COLORS.white : COLORS.black;
	const textColor = lightMode ? COLORS.black : COLORS.white;

	// Timing breakpoints
	const logoFadeInEnd = fps * 0.6; // Logo fades in by 0.6s
	const logoHoldEnd = fps * 1.5; // Logo holds center until 1.5s
	const logoSlideEnd = fps * 2; // Logo finishes sliding left by 2s
	const typingStart = fps * 1.8; // Typing starts at 1.8s (slightly before logo finishes sliding)

	// Logo fade-in from background
	const logoFadeInOpacity = interpolate(
		frame,
		[0, logoFadeInEnd],
		[0, 1],
		{
			extrapolateRight: 'clamp',
		}
	);

	// Logo horizontal position animation
	// Phase 1: Fade in centered (0-0.6s)
	// Phase 2: Hold in center (0.6-1.5s)
	// Phase 3: Slide to left side to make room for text (1.5-2s)
	const logoX = interpolate(
		frame,
		[logoHoldEnd, logoSlideEnd],
		[0, -250], // Hold center, then slide left
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.inOut(Easing.ease),
		}
	);

	// Typing animation with random variation
	const textToType = 'Happily Hacking';
	const baseCharsPerSecond = 12; // Typing speed
	const framesSinceTypingStart = Math.max(0, frame - typingStart);

	// Calculate which character should be showing with random variation
	let charsToShow = 0;
	let accumulatedFrames = 0;
	const baseFramesPerChar = fps / baseCharsPerSecond;

	for (let i = 0; i < textToType.length; i++) {
		// Add random variation (±50%) to each character's delay
		// Use deterministic pseudo-random based on character index
		const seed = (i * 9301 + 49297) % 233280;
		const random = seed / 233280;
		const variation = 0.2 + random * 1.8; // Range: 0.2 to 2.0
		const framesForThisChar = baseFramesPerChar * variation;

		accumulatedFrames += framesForThisChar;

		if (framesSinceTypingStart >= accumulatedFrames) {
			charsToShow = i + 1;
		} else {
			break;
		}
	}

	const displayedText = textToType.slice(0, Math.max(0, charsToShow));

	// Cursor blink (blinks every 0.5 seconds = 15 frames at 30fps)
	// Cursor always blinks once typing has started
	const cursorVisible =
		framesSinceTypingStart >= 0 &&
		Math.floor(framesSinceTypingStart / 15) % 2 === 0;

	// Show typing section when typing starts
	const showTyping = frame >= typingStart;

	return (
		<>
			{/* Google Fonts import for JetBrains Mono */}
			<link
				href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
				rel="stylesheet"
			/>

			<AbsoluteFill
				style={{
					backgroundColor: backgroundColor,
					fontFamily: '"JetBrains Mono", monospace',
				}}
			>
				{/* Logo Section - Always visible, stays at end */}
				<div
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: `translate(-50%, -50%) translateX(${logoX}px)`,
						opacity: logoFadeInOpacity,
						backgroundColor: COLORS.orange,
						padding: '20px 30px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<span
						style={{
							color: textColor,
							fontSize: '90px',
							fontWeight: 700,
							lineHeight: 0.9,
							letterSpacing: '-2px',
						}}
					>
						J
					</span>
					<span
						style={{
							color: textColor,
							fontSize: '90px',
							fontWeight: 700,
							lineHeight: 0.9,
							letterSpacing: '-2px',
						}}
					>
						K
					</span>
				</div>

				{/* Tagline Section */}
				{showTyping && (
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: 'calc(50% - 30px)',
							transform: 'translateY(-50%)',
							display: 'flex',
							alignItems: 'center',
							gap: '2px',
						}}
					>
						<span
							style={{
								color: textColor,
								fontSize: '48px',
								fontWeight: 500,
								letterSpacing: '1px',
							}}
						>
							{displayedText}
						</span>
						{cursorVisible && (
							<span
								style={{
									color: textColor,
									fontSize: '48px',
									fontWeight: 700,
								}}
							>
								█
							</span>
						)}
					</div>
				)}

				{/* Audio - Plays after typingStart frames (1.8s = 54 frames at 30fps) */}
				<Sequence from={typingStart}>
					<Audio src={staticFile('typing.m4a')} volume={0.2} />
				</Sequence>
			</AbsoluteFill>
		</>
	);
};
