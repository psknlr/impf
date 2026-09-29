if (window.tailwind) tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Noto Sans SC"', 'sans-serif'],
                scifi: ['Orbitron', '"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                'neon-blue': '#00f3ff',
                'neon-purple': '#bc13fe',
                'neon-violet': '#c84bff', // 小字号紫色 (对比度达标)
                'bio-green': '#00ff9d',
                'deep-bg': '#050b14',
                'glass': 'rgba(13, 25, 48, 0.7)',
                'glass-border': 'rgba(0, 243, 255, 0.15)',
            },
            boxShadow: {
                'neon': '0 0 10px rgba(0, 243, 255, 0.4), 0 0 20px rgba(0, 243, 255, 0.2)',
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        }
    }
}
