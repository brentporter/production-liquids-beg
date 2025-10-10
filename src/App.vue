<template>
  <div class="app-container">
    <AppHeader />
    <div class="main-layout">
      <aside class="sidebar" style="background-color: #000000;color:white;" :class="{ open: sidebarOpen }">
        <button class="sidebar-close" @click="sidebarOpen = false">×</button>
        <MapControls />
      </aside>
      <main class="content">
        <button class="menu-toggle" @click="sidebarOpen = !sidebarOpen">
          ☰
        </button>
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

const sidebarOpen = ref(false)
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
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgb(var(--v-theme-border));
  overflow-y: auto;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.content {
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: hidden;
}

.menu-toggle {
  display: none;
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
  display: none;
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  z-index: 20;
}

/* Mobile Responsive */
@media (max-width: 768px) {
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
  .sidebar {
    width: 100%;
  }
}
</style>