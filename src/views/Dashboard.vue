
<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Energy Data Dashboard</h1>
      <p class="subtitle">Production and Injection Monitoring</p>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <h3>Quick Access</h3>
        </div>
        <div class="card-content">
          <router-link to="/map" class="nav-link">
            <span class="icon">🗺️</span>
            <span>View Map</span>
            <span class="arrow">→</span>
          </router-link>
          <router-link to="/analytics" class="nav-link">
            <span class="icon">📊</span>
            <span>Analytics</span>
            <span class="arrow">→</span>
          </router-link>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Production Summary</h3>
        </div>
        <div class="card-content">
          <div class="stat">
            <span class="stat-label">Liquid Oil</span>
            <span class="stat-value">--</span>
          </div>
          <div class="stat">
            <span class="stat-label">Gas</span>
            <span class="stat-value">--</span>
          </div>
          <div class="stat">
            <span class="stat-label">Produced Water</span>
            <span class="stat-value">--</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Injection Summary</h3>
        </div>
        <div class="card-content">
          <div class="stat">
            <span class="stat-label">HF Fluid</span>
            <span class="stat-value">--</span>
          </div>
          <div class="stat">
            <span class="stat-label">Salt Water Disposal</span>
            <span class="stat-value">--</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Recent Activity</h3>
        </div>
        <div class="card-content">
          <p class="activity-message">No recent data</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: #999;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.card-content {
  padding: 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
}

.nav-link:last-child {
  margin-bottom: 0;
}

.nav-link:hover {
  background: #efefef;
  border-color: #667eea;
  color: #667eea;
}

.nav-link .icon {
  font-size: 20px;
}

.nav-link .arrow {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nav-link:hover .arrow {
  opacity: 1;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.activity-message {
  color: #999;
  font-size: 14px;
  margin: 0;
  text-align: center;
  padding: 12px 0;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .dashboard-header h1 {
    font-size: 24px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
