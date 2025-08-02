// Crime File Management System - Main JavaScript

class CrimeManagementSystem {
    constructor() {
        this.crimes = [];
        this.currentFilter = {};
        this.map = null;
        this.markers = [];
        this.charts = {};
        this.editingCrimeId = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.initializeMap();
        this.updateStatistics();
        this.renderCrimeList();
        this.setupCharts();
    }

    // Data Management
    loadData() {
        const savedData = localStorage.getItem('crimeData');
        if (savedData) {
            this.crimes = JSON.parse(savedData);
        } else {
            // Load sample data
            this.crimes = this.getSampleData();
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('crimeData', JSON.stringify(this.crimes));
    }

    getSampleData() {
        return [
            {
                id: 1,
                title: "Armed Robbery at Central Bank",
                type: "Theft",
                date: "2024-01-15T14:30:00",
                status: "Under Investigation",
                location: "123 Main Street, Downtown",
                latitude: 40.7128,
                longitude: -74.0060,
                description: "Armed suspect entered the bank and demanded money from tellers. Suspect fled with approximately $50,000.",
                victimName: "Central Bank",
                suspectName: "Unknown",
                officerName: "Detective Johnson",
                caseNumber: "CR-2024-001"
            },
            {
                id: 2,
                title: "Assault at Park Avenue",
                type: "Assault",
                date: "2024-01-20T22:15:00",
                status: "Solved",
                location: "456 Park Avenue, Midtown",
                latitude: 40.7589,
                longitude: -73.9851,
                description: "Physical altercation between two individuals resulted in minor injuries. Suspect apprehended.",
                victimName: "John Smith",
                suspectName: "Mike Johnson",
                officerName: "Officer Davis",
                caseNumber: "CR-2024-002"
            },
            {
                id: 3,
                title: "Burglary at Residential Complex",
                type: "Burglary",
                date: "2024-01-25T03:45:00",
                status: "Open",
                location: "789 Oak Street, Uptown",
                latitude: 40.7505,
                longitude: -73.9934,
                description: "Multiple apartments broken into during early morning hours. Electronics and jewelry stolen.",
                victimName: "Multiple Residents",
                suspectName: "Unknown",
                officerName: "Detective Wilson",
                caseNumber: "CR-2024-003"
            },
            {
                id: 4,
                title: "Vandalism at Public Library",
                type: "Vandalism",
                date: "2024-02-01T19:20:00",
                status: "Closed",
                location: "321 Library Lane, Downtown",
                latitude: 40.7142,
                longitude: -74.0064,
                description: "Graffiti found on library walls and books damaged. Security cameras captured suspect.",
                victimName: "Public Library",
                suspectName: "Teenage Group",
                officerName: "Officer Brown",
                caseNumber: "CR-2024-004"
            },
            {
                id: 5,
                title: "Credit Card Fraud",
                type: "Fraud",
                date: "2024-02-05T11:30:00",
                status: "Under Investigation",
                location: "Online Transaction",
                latitude: 40.7128,
                longitude: -74.0060,
                description: "Multiple unauthorized transactions detected on victim's credit card. Suspected data breach.",
                victimName: "Sarah Johnson",
                suspectName: "Unknown",
                officerName: "Detective Martinez",
                caseNumber: "CR-2024-005"
            },
            {
                id: 6,
                title: "Vehicle Theft in Downtown",
                type: "Theft",
                date: "2024-02-10T08:15:00",
                status: "Open",
                location: "555 Broadway, Downtown",
                latitude: 40.7589,
                longitude: -73.9851,
                description: "Luxury vehicle stolen from parking garage. Security footage shows suspect.",
                victimName: "Robert Chen",
                suspectName: "Unknown",
                officerName: "Officer Garcia",
                caseNumber: "CR-2024-006"
            },
            {
                id: 7,
                title: "Assault at Midtown Station",
                type: "Assault",
                date: "2024-02-12T16:45:00",
                status: "Solved",
                location: "Grand Central Terminal, Midtown",
                latitude: 40.7527,
                longitude: -73.9772,
                description: "Physical altercation between commuters. Suspect apprehended by transit police.",
                victimName: "Lisa Thompson",
                suspectName: "David Wilson",
                officerName: "Transit Officer Lee",
                caseNumber: "CR-2024-007"
            },
            {
                id: 8,
                title: "Burglary at Uptown Residence",
                type: "Burglary",
                date: "2024-02-15T02:30:00",
                status: "Under Investigation",
                location: "1234 Riverside Drive, Uptown",
                latitude: 40.7829,
                longitude: -73.9654,
                description: "Home invasion while residents were away. Electronics and jewelry stolen.",
                victimName: "Maria Rodriguez",
                suspectName: "Unknown",
                officerName: "Detective Anderson",
                caseNumber: "CR-2024-008"
            }
        ];
    }

    // Event Listeners
    setupEventListeners() {
        // Header buttons
        document.getElementById('addCrimeBtn').addEventListener('click', () => this.openModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeViewModal').addEventListener('click', () => this.closeViewModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('crimeForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('crimeTypeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('startDateFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('endDateFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Modal backdrop click
        document.getElementById('crimeModal').addEventListener('click', (e) => {
            if (e.target.id === 'crimeModal') this.closeModal();
        });
        document.getElementById('viewModal').addEventListener('click', (e) => {
            if (e.target.id === 'viewModal') this.closeViewModal();
        });
    }

    // Modal Management
    openModal(crimeId = null) {
        this.editingCrimeId = crimeId;
        const modal = document.getElementById('crimeModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('crimeForm');

        if (crimeId) {
            const crime = this.crimes.find(c => c.id === crimeId);
            if (crime) {
                title.textContent = 'Edit Crime Record';
                this.populateForm(crime);
            }
        } else {
            title.textContent = 'Add New Crime Record';
            form.reset();
            // Set default date to current date/time
            document.getElementById('crimeDate').value = new Date().toISOString().slice(0, 16);
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('crimeModal').style.display = 'none';
        this.editingCrimeId = null;
    }

    openViewModal(crimeId) {
        const crime = this.crimes.find(c => c.id === crimeId);
        if (crime) {
            const modal = document.getElementById('viewModal');
            const detailsContainer = document.getElementById('crimeDetails');
            
            detailsContainer.innerHTML = this.generateCrimeDetailsHTML(crime);
            modal.style.display = 'block';
        }
    }

    closeViewModal() {
        document.getElementById('viewModal').style.display = 'none';
    }

    populateForm(crime) {
        document.getElementById('crimeTitle').value = crime.title;
        document.getElementById('crimeType').value = crime.type;
        document.getElementById('crimeDate').value = crime.date.slice(0, 16);
        document.getElementById('crimeStatus').value = crime.status;
        document.getElementById('crimeLocation').value = crime.location;
        document.getElementById('latitude').value = crime.latitude || '';
        document.getElementById('longitude').value = crime.longitude || '';
        document.getElementById('crimeDescription').value = crime.description || '';
        document.getElementById('victimName').value = crime.victimName || '';
        document.getElementById('suspectName').value = crime.suspectName || '';
        document.getElementById('officerName').value = crime.officerName || '';
        document.getElementById('caseNumber').value = crime.caseNumber || '';
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const crimeData = {
            title: formData.get('crimeTitle') || document.getElementById('crimeTitle').value,
            type: formData.get('crimeType') || document.getElementById('crimeType').value,
            date: formData.get('crimeDate') || document.getElementById('crimeDate').value,
            status: formData.get('crimeStatus') || document.getElementById('crimeStatus').value,
            location: formData.get('crimeLocation') || document.getElementById('crimeLocation').value,
            latitude: parseFloat(formData.get('latitude') || document.getElementById('latitude').value) || null,
            longitude: parseFloat(formData.get('longitude') || document.getElementById('longitude').value) || null,
            description: formData.get('crimeDescription') || document.getElementById('crimeDescription').value,
            victimName: formData.get('victimName') || document.getElementById('victimName').value,
            suspectName: formData.get('suspectName') || document.getElementById('suspectName').value,
            officerName: formData.get('officerName') || document.getElementById('officerName').value,
            caseNumber: formData.get('caseNumber') || document.getElementById('caseNumber').value
        };

        if (this.editingCrimeId) {
            // Update existing crime
            const index = this.crimes.findIndex(c => c.id === this.editingCrimeId);
            if (index !== -1) {
                this.crimes[index] = { ...this.crimes[index], ...crimeData };
            }
        } else {
            // Add new crime
            crimeData.id = Date.now();
            this.crimes.push(crimeData);
        }

        this.saveData();
        this.updateStatistics();
        this.renderCrimeList();
        this.updateMap();
        this.updateCharts();
        this.closeModal();
        this.showMessage('Crime record saved successfully!', 'success');
    }

    // Search and Filtering
    handleSearch(query) {
        this.currentFilter.search = query.toLowerCase();
        this.renderCrimeList();
    }

    applyFilters() {
        this.currentFilter.type = document.getElementById('crimeTypeFilter').value;
        this.currentFilter.status = document.getElementById('statusFilter').value;
        this.currentFilter.startDate = document.getElementById('startDateFilter').value;
        this.currentFilter.endDate = document.getElementById('endDateFilter').value;
        
        this.renderCrimeList();
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('crimeTypeFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('startDateFilter').value = '';
        document.getElementById('endDateFilter').value = '';
        
        this.currentFilter = {};
        this.renderCrimeList();
    }

    getFilteredCrimes() {
        let filtered = [...this.crimes];

        // Search filter
        if (this.currentFilter.search) {
            filtered = filtered.filter(crime => 
                crime.title.toLowerCase().includes(this.currentFilter.search) ||
                crime.description.toLowerCase().includes(this.currentFilter.search) ||
                crime.location.toLowerCase().includes(this.currentFilter.search) ||
                crime.victimName.toLowerCase().includes(this.currentFilter.search) ||
                crime.suspectName.toLowerCase().includes(this.currentFilter.search) ||
                crime.officerName.toLowerCase().includes(this.currentFilter.search) ||
                crime.caseNumber.toLowerCase().includes(this.currentFilter.search)
            );
        }

        // Type filter
        if (this.currentFilter.type) {
            filtered = filtered.filter(crime => crime.type === this.currentFilter.type);
        }

        // Status filter
        if (this.currentFilter.status) {
            filtered = filtered.filter(crime => crime.status === this.currentFilter.status);
        }

        // Date range filter
        if (this.currentFilter.startDate) {
            filtered = filtered.filter(crime => crime.date >= this.currentFilter.startDate);
        }
        if (this.currentFilter.endDate) {
            filtered = filtered.filter(crime => crime.date <= this.currentFilter.endDate + 'T23:59:59');
        }

        return filtered;
    }

    // Rendering
    renderCrimeList() {
        const container = document.getElementById('crimeList');
        const filteredCrimes = this.getFilteredCrimes();

        if (filteredCrimes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No crimes found</h3>
                    <p>Try adjusting your search criteria or add a new crime record.</p>
                    <button class="btn btn-primary" onclick="crimeSystem.openModal()">
                        <i class="fas fa-plus"></i> Add Crime Record
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredCrimes.map(crime => this.generateCrimeCardHTML(crime)).join('');
    }

    generateCrimeCardHTML(crime) {
        const date = new Date(crime.date).toLocaleDateString();
        const time = new Date(crime.date).toLocaleTimeString();
        
        return `
            <div class="crime-card" onclick="crimeSystem.openViewModal(${crime.id})">
                <div class="crime-header">
                    <div>
                        <div class="crime-title">${crime.title}</div>
                        <span class="crime-type ${crime.type.toLowerCase()}">${crime.type}</span>
                    </div>
                    <span class="crime-status ${crime.status.toLowerCase().replace(' ', '-')}">${crime.status}</span>
                </div>
                
                <div class="crime-details">
                    <div class="crime-detail">
                        <div class="crime-detail-label">Date & Time</div>
                        <div class="crime-detail-value">${date} at ${time}</div>
                    </div>
                    <div class="crime-detail">
                        <div class="crime-detail-label">Location</div>
                        <div class="crime-detail-value">${crime.location}</div>
                    </div>
                    <div class="crime-detail">
                        <div class="crime-detail-label">Case Number</div>
                        <div class="crime-detail-value">${crime.caseNumber || 'N/A'}</div>
                    </div>
                    <div class="crime-detail">
                        <div class="crime-detail-label">Officer</div>
                        <div class="crime-detail-value">${crime.officerName || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="crime-actions">
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); crimeSystem.openModal(${crime.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="event.stopPropagation(); crimeSystem.deleteCrime(${crime.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    generateCrimeDetailsHTML(crime) {
        const date = new Date(crime.date).toLocaleDateString();
        const time = new Date(crime.date).toLocaleTimeString();
        
        return `
            <div class="crime-details-grid">
                <div class="detail-item">
                    <div class="detail-label">Title</div>
                    <div class="detail-value">${crime.title}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Type</div>
                    <div class="detail-value">
                        <span class="crime-type ${crime.type.toLowerCase()}">${crime.type}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date & Time</div>
                    <div class="detail-value">${date} at ${time}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                        <span class="crime-status ${crime.status.toLowerCase().replace(' ', '-')}">${crime.status}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${crime.location}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Coordinates</div>
                    <div class="detail-value">${crime.latitude}, ${crime.longitude}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Case Number</div>
                    <div class="detail-value">${crime.caseNumber || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Investigating Officer</div>
                    <div class="detail-value">${crime.officerName || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Victim</div>
                    <div class="detail-value">${crime.victimName || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Suspect</div>
                    <div class="detail-value">${crime.suspectName || 'N/A'}</div>
                </div>
            </div>
            
            ${crime.description ? `
                <div class="detail-item">
                    <div class="detail-label">Description</div>
                    <div class="detail-value">${crime.description}</div>
                </div>
            ` : ''}
            
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="crimeSystem.closeViewModal()">Close</button>
                <button class="btn btn-primary" onclick="crimeSystem.openModal(${crime.id})">
                    <i class="fas fa-edit"></i> Edit Record
                </button>
            </div>
        `;
    }

    // Map Management
    initializeMap() {
        this.map = L.map('map').setView([40.7128, -74.0060], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.updateMap();
    }

    updateMap() {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Add markers for each crime
        this.crimes.forEach(crime => {
            if (crime.latitude && crime.longitude) {
                const marker = L.marker([crime.latitude, crime.longitude])
                    .bindPopup(this.generateMapPopupHTML(crime))
                    .addTo(this.map);
                this.markers.push(marker);
            }
        });
    }

    generateMapPopupHTML(crime) {
        const date = new Date(crime.date).toLocaleDateString();
        return `
            <div style="min-width: 200px;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${crime.title}</h4>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${crime.type}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${crime.status}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${crime.location}</p>
                <button onclick="crimeSystem.openViewModal(${crime.id})" 
                        style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                    View Details
                </button>
            </div>
        `;
    }

    // Analytics and Charts
    setupCharts() {
        this.createCrimeTypeChart();
        this.createMonthlyTrendChart();
        this.createStatusChart();
        this.createGeographicDistributionChart();
    }

    updateCharts() {
        if (this.charts.crimeType) {
            this.charts.crimeType.destroy();
        }
        if (this.charts.monthlyTrend) {
            this.charts.monthlyTrend.destroy();
        }
        if (this.charts.status) {
            this.charts.status.destroy();
        }
        if (this.charts.geographic) {
            this.charts.geographic.destroy();
        }
        
        this.setupCharts();
    }

    createCrimeTypeChart() {
        const ctx = document.getElementById('crimeTypeChart').getContext('2d');
        const typeData = this.getCrimeTypeData();
        
        this.charts.crimeType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: typeData.labels,
                datasets: [{
                    data: typeData.values,
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createMonthlyTrendChart() {
        const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
        const trendData = this.getMonthlyTrendData();
        
        this.charts.monthlyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'Crimes per Month',
                    data: trendData.values,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createStatusChart() {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const statusData = this.getStatusData();
        
        this.charts.status = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statusData.labels,
                datasets: [{
                    label: 'Cases by Status',
                    data: statusData.values,
                    backgroundColor: [
                        '#FFC107', '#17A2B8', '#DC3545', '#28A745'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    getCrimeTypeData() {
        const typeCount = {};
        this.crimes.forEach(crime => {
            typeCount[crime.type] = (typeCount[crime.type] || 0) + 1;
        });
        
        return {
            labels: Object.keys(typeCount),
            values: Object.values(typeCount)
        };
    }

    getMonthlyTrendData() {
        const monthCount = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        this.crimes.forEach(crime => {
            const date = new Date(crime.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
        });
        
        const sortedMonths = Object.keys(monthCount).sort();
        return {
            labels: sortedMonths.map(key => {
                const [year, month] = key.split('-');
                return `${months[parseInt(month)]} ${year}`;
            }),
            values: sortedMonths.map(key => monthCount[key])
        };
    }

    getStatusData() {
        const statusCount = {};
        this.crimes.forEach(crime => {
            statusCount[crime.status] = (statusCount[crime.status] || 0) + 1;
        });
        
        return {
            labels: Object.keys(statusCount),
            values: Object.values(statusCount)
        };
    }

    getGeographicData() {
        const areaCount = {};
        this.crimes.forEach(crime => {
            // Extract area/neighborhood from location
            let area = 'Unknown Area';
            if (crime.location) {
                if (crime.location.includes('Downtown')) {
                    area = 'Downtown';
                } else if (crime.location.includes('Midtown')) {
                    area = 'Midtown';
                } else if (crime.location.includes('Uptown')) {
                    area = 'Uptown';
                } else if (crime.location.includes('Online')) {
                    area = 'Online';
                } else {
                    // Extract area from location string
                    const parts = crime.location.split(',');
                    if (parts.length > 1) {
                        area = parts[1].trim();
                    } else {
                        area = parts[0].trim();
                    }
                }
            }
            areaCount[area] = (areaCount[area] || 0) + 1;
        });
        
        return {
            labels: Object.keys(areaCount),
            values: Object.values(areaCount)
        };
    }

    createGeographicDistributionChart() {
        const ctx = document.getElementById('geographicChart').getContext('2d');
        const geoData = this.getGeographicData();
        
        this.charts.geographic = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: geoData.labels,
                datasets: [{
                    label: 'Crimes by Area',
                    data: geoData.values,
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
                        '#A8E6CF', '#FF8B94', '#FFC3A0', '#FFAFBD', '#C06C84', '#6C5B7B'
                    ],
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Statistics
    updateStatistics() {
        const totalCrimes = this.crimes.length;
        const openCases = this.crimes.filter(crime => crime.status === 'Open').length;
        const solvedCases = this.crimes.filter(crime => crime.status === 'Solved').length;

        document.getElementById('totalCrimes').textContent = totalCrimes;
        document.getElementById('openCases').textContent = openCases;
        document.getElementById('solvedCases').textContent = solvedCases;
    }

    // Tab Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Handle map resize
        if (tabName === 'map' && this.map) {
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
        }
    }

    // Data Export/Import
    exportData() {
        const dataStr = JSON.stringify(this.crimes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `crime-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Data exported successfully!', 'success');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    this.crimes = importedData;
                    this.saveData();
                    this.updateStatistics();
                    this.renderCrimeList();
                    this.updateMap();
                    this.updateCharts();
                    this.showMessage('Data imported successfully!', 'success');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                this.showMessage('Error importing data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    // Crime Management
    deleteCrime(crimeId) {
        if (confirm('Are you sure you want to delete this crime record? This action cannot be undone.')) {
            this.crimes = this.crimes.filter(crime => crime.id !== crimeId);
            this.saveData();
            this.updateStatistics();
            this.renderCrimeList();
            this.updateMap();
            this.updateCharts();
            this.showMessage('Crime record deleted successfully!', 'success');
        }
    }

    // Utility Functions
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        document.querySelector('.main-area').insertBefore(messageDiv, document.querySelector('.tabs'));
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the system when the page loads
let crimeSystem;
document.addEventListener('DOMContentLoaded', () => {
    crimeSystem = new CrimeManagementSystem();
}); 