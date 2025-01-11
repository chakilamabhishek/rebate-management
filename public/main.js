async function fetchToken() {
    const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: 'achakilam' })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch token');
    }

    const data = await response.json();
    return data.token;
}

async function fetchData(token) {
    const claimsResponse = await fetch('/api/rebate-claims?startDate=2024-01-01&endDate=2026-12-31', {
        headers: {
            'Authorization': `${token}`
        }
    });

    if (!claimsResponse.ok) {
        throw new Error('Failed to fetch claims data');
    }

    const claimsData = await claimsResponse.json();

    renderStatusCounts(claimsData.statusCounts);
    renderTable('recent-rebate-programs', claimsData.recentRebatePrograms, ['id', 'program_name', 'rebate_percentage', 'start_date', 'end_date', 'eligibility_criteria', 'created_at']);
    renderTable('recent-transactions', claimsData.recentTransactions, ['transaction_id', 'amount', 'transaction_date', 'rebate_program_id', 'created_at']);
    renderTable('recent-rebate-claims', claimsData.recentRebateClaims, ['claim_id', 'transaction_id', 'claim_amount', 'claim_status', 'claim_date', 'created_at']);
}

function renderStatusCounts(statusCounts) {
    const statusCountsContainer = document.querySelector('#status-counts tbody');
    statusCountsContainer.innerHTML = '';

    statusCounts.forEach(statusCount => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${statusCount.claim_status}</td>
            <td>${statusCount.count}</td>
        `;
        statusCountsContainer.appendChild(row);
    });
}

function renderTable(containerId, data, columns) {
    const container = document.querySelector(`#${containerId} tbody`);
    container.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.textContent = item[column];
            row.appendChild(cell);
        });
        container.appendChild(row);
    });
}

async function init() {
    try {
        const token = await fetchToken();
        await fetchData(token);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

init();