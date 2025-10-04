const ShinyText = ({ text, disabled = false, speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`text-white text-5xl md:text-7xl font-bold leading-tight bg-clip-text inline-block m-0 ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(255,255,255,0) 40%, #fff 50%, #00eaff 60%, rgba(255,255,255,0) 70%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        color: 'white',
        animationDuration: animationDuration,
        margin: 0
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       keyframes: {
//         shine: {
//           '0%': { 'background-position': '100%' },
//           '100%': { 'background-position': '-100%' },
//         },
//       },
//       animation: {
//         shine: 'shine 5s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// };
