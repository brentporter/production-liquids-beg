<template>
  <div class="app-container">
    <AppHeader />
    <div class="main-layout">
      <aside class="sidebar" v-show="sidebarOpen">
        <button class="sidebar-close" v-show="sidebarOpen" @click="sidebarOpen = !sidebarOpen">×</button>
        <MapControls />
      </aside>
      <main class="content">
        <button class="menu-toggle" style="color: #000000" v-show="!sidebarOpen" @click="sidebarOpen = !sidebarOpen">☰</button>
        <MapView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import MapControls from './components/MapControls.vue'
import MapView from './components/MapView.vue'

const sidebarOpen = ref(true)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.sidebar {
  width: 280px;
  border-right: 1px solid rgb(var(--v-theme-border));
  overflow-y: auto;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
  background-color: #000000;
  color: whitesmoke;
}

.content {
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: hidden;
}

.sidebar-toggle {
  background-color: #000000;
  position: absolute;
  top: 10px;
  left: 225px;
  width: 40px;
  height: 40px;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 20;
}

.menu-toggle {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sidebar-close {
  position: relative;
  float: left;
  top: 10px;
  left: 252px;
  background: none;
  border: none;
  font-size: 24px;
  color: whitesmoke;
  cursor: pointer;
  z-index: 20;
}
.esri-ui-top-left {
  top: 3.75rem !important;
  left: 0.25rem !important;
}

@media (max-width: 480px) {
  .esri-ui-top-left {
    top: 2.8rem !important;
    left: 0.125rem !important;
  }
}
/* Mobile Responsive */
@media (max-width: 768px) {
  .esri-ui-top-left {
    top: 3.125rem !important;
    left: 0.125rem !important;
  }
  .sidebar {
    position: absolute;
    height: 100%;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 100;
    max-height: calc(100vh - 60px);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: block;
  }

  .menu-toggle {
    display: block;
  }
}

@media (max-width: 480px) {
  .esri-ui-top-left {
    top: 2.8rem !important;
    left: 0.125rem !important;
  }
  .sidebar {
    width: 100%;
  }
}
</style>