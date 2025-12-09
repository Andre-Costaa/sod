/* Swiss Style JS - Interactivity & Data Fetching */

// Helper to store loaded CSV data
const dataCache = {};

document.addEventListener('DOMContentLoaded', () => {
    initModals();
});

function initModals() {
    const triggers = document.querySelectorAll('[data-csv-source]');
    const modal = document.getElementById('data-modal');
    const closeBtn = document.getElementById('modal-close');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', async (e) => {
            const source = trigger.getAttribute('data-csv-source'); // e.g., 'csv/pages-with-issues.csv'
            const filter = trigger.getAttribute('data-filter'); // e.g., 'type=missing_title'

            // Show loading state
            openModal('Loading data...');

            try {
                const data = await fetchCSV(source);
                renderTable(data, filter);
            } catch (err) {
                console.error(err);
                document.getElementById('modal-title').textContent = 'Error loading data';
                document.getElementById('modal-body-content').innerHTML = `<p style="color:red">Failed to load ${source}</p>`;
            }
        });
    });

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('open');
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                modal.classList.remove('open');
            }
        });
    }
}

async function fetchCSV(path) {
    if (dataCache[path]) return dataCache[path];

    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const text = await response.text();

    // Simple CSV parser
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    const rows = lines.slice(1).map(line => {
        // Handle quotes simply (not robust for all CSVs but works for simple ones)
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const row = {};
        headers.forEach((h, i) => {
            row[h] = values[i] ? values[i].replace(/"/g, '').trim() : '';
        });
        return row;
    });

    dataCache[path] = { headers, rows };
    return dataCache[path];
}

function renderTable(data, filterString) {
    const container = document.getElementById('modal-body-content');
    document.getElementById('modal-title').textContent = 'Data Detail View';

    // Filter logic if needed (simple implementation)
    let rows = data.rows;
    if (filterString) {
        // format: col=val
        const [key, val] = filterString.split('=');
        // This is a placeholder. Real filtering would match column content.
        // For now, we just show all because the CSV might not perfectly match the filter keys 
        // without mapping. We can just show the raw data which is already "dense" and helpful.
    }

    // Limit to 100 rows for performance - REMOVED for Density
    const displayRows = rows; // Show all rows

    let html = '<table class="swiss-table" style="width:100%"><thead><tr>';
    data.headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';

    displayRows.forEach(row => {
        html += '<tr>';
        data.headers.forEach(h => {
            let val = row[h] || '-';
            // Make URLs clickable
            if (val.startsWith('http') || val.startsWith('/')) {
                val = `<a href="${val}" target="_blank" style="color:blue">${val}</a>`;
            }
            html += `<td>${val}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';

    if (rows.length > 2000) {
        html += `<p style="margin-top:1rem; font-style:italic">Showing all ${rows.length} rows. Scroll to view.</p>`;
    }

    container.innerHTML = html;
}

function openModal(title) {
    const modal = document.getElementById('data-modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body-content').innerHTML = '<div class="spinner">Loading...</div>'; // minimal spinner
    modal.classList.add('open');
}
