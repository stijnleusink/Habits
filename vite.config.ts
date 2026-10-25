import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
 plugins:[react(), VitePWA({registerType:'prompt', injectRegister:null, includeAssets:['icons/*.png'],
 manifest:{id:'/',name:'Habits',short_name:'Habits',description:'Your progress. Every day.',lang:'nl',start_url:'/',scope:'/',display:'standalone',background_color:'#0b1220',theme_color:'#0b1220',icons:[{src:'/icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png'},{src:'/icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},
 workbox:{globPatterns:['**/*.{js,css,html,png,svg,woff2}'],navigateFallback:'/index.html',cleanupOutdatedCaches:true,maximumFileSizeToCacheInBytes:3_000_000}})],
 test:{include:['src/tests/**/*.test.ts'],environment:'node',setupFiles:['./src/tests/setup.ts'],reporters:['default','json'],outputFile:{json:'test-results/unit-results.json'}},
 server:{allowedHosts:true}
});
