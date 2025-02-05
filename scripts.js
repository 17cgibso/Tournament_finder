document.addEventListener('DOMContentLoaded', function() {
    const tournaments = [
        // Add your tournament data here
        // Example:
        {
            id: 1,
            "Start Date": "January 15, 2024",
            "End Date": "January 20, 2024",
            "# of Rounds": 4,
            "Event Name": "Winter Open",
            "Course": "Snowy Golf Club",
            "Country": "Canada",
            "2024 Power": 1500,
            "Continent": "North America",
            "Field": "Open"
        }
        // Add more tournament objects as needed
    ];
    
    const continents = ["North America", "Europe", "Asia", "Oceania", "Africa", "South America"];
    const availableCountries = ["Canada", "USA", "UK", "Germany", "Japan"];
    const currentDate = moment();

    // Initialize DataTable without pagination
    $('#tournament-table').DataTable({
        "paging": false,
        "columnDefs": [
            {
                "targets": [1, 2], // Targets the Start Date and End Date columns
                "render": function(data, type, row) {
                    if (type === 'sort' || type === 'type') {
                        return moment(data, 'MMMM DD, YYYY').format('YYYYMMDD');
                    }
                    return data;
                }
            }
        ]
    });

    let selectedContinents = [];
    let selectedCountries = [];
    let selectedMonths = [];
    let selectedFields = [];
    let selectedPowerMin = 0;
    let selectedPowerMax = 3000;
    let showFutureEventsOnly = false;

    // Function to apply filters
    function applyFilters() {
        $('#tournament-table tbody tr').each(function() {
            var row = $(this);
            var continent = row.data('continent');
            var country = row.data('country');
            var startDate = moment(row.data('start-date'), 'MMMM DD, YYYY');
            var endDate = moment(row.data('end-date'), 'MMMM DD, YYYY');
            var power = parseInt(row.data('power'));
            var field = row.data('field');

            var showByContinent = (!selectedContinents.length || selectedContinents.includes(continent));
            var showByCountry = (!selectedCountries.length || selectedCountries.includes(country));
            var showByMonth = (!selectedMonths.length ||
                               selectedMonths.includes(startDate.format('MMMM')) ||
                               selectedMonths.includes(endDate.format('MMMM')));
            var showByPower = (power >= selectedPowerMin && power <= selectedPowerMax);
            var showByField = (!selectedFields.length || selectedFields.includes(field));
            var showByDate = (!showFutureEventsOnly || startDate.isAfter(currentDate));

            if (showByContinent && showByCountry && showByMonth && showByPower && showByField && showByDate) {
                row.show();
            } else {
                row.hide();
            }
        });

        updateSelectedFilters();
    }

    // Function to update the selected filters display
    function updateSelectedFilters() {
        let filters = [];
        selectedContinents.forEach(continent => {
            filters.push({ type: 'continent', value: continent });
        });
        selectedCountries.forEach(country => {
            filters.push({ type: 'country', value: country });
        });
        selectedMonths.forEach(month => {
            filters.push({ type: 'month', value: month });
        });
        selectedFields.forEach(field => {
            filters.push({ type: 'field', value: field });
        });
        filters.push({ type: 'power', value: `Min: ${selectedPowerMin}, Max: ${selectedPowerMax}` });
        if (showFutureEventsOnly) {
            filters.push({ type: 'date', value: 'Future Events Only' });
        }

        $('#selected-filters').html('');
        filters.forEach((filter, index) => {
            let filterClass = '';
            if (filter.type === 'continent') filterClass = 'btn-danger';
            if (filter.type === 'country') filterClass = 'btn-success';
            if (filter.type === 'month') filterClass = 'btn-primary';
            if (filter.type === 'field') filterClass = 'btn-purple';
            if (filter.type === 'power' || filter.type === 'date') filterClass = 'btn-secondary';

            $('#selected-filters').append(
                `<button class="filter-item btn ${filterClass} m-1" data-type="${filter.type}" data-value="${filter.value}">
                    ${filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}: ${filter.value}
                 </button>`
            );
        });
    }

    // Update power range values
    function updatePowerRange() {
        selectedPowerMin = parseInt(document.getElementById('power-min').value);
        selectedPowerMax = parseInt(document.getElementById('power-max').value);
        applyFilters();
    }

    // Apply filter when a continent button is clicked
    $('.continent-button').on('click', function() {
        const continent = $(this).data('continent');
        if (!selectedContinents.includes(continent)) {
            selectedContinents.push(continent);
            $(this).addClass('active');
        } else {
            selectedContinents = selectedContinents.filter(c => c !== continent);
            $(this).removeClass('active');
        }
        applyFilters();
    });

    // Apply filter when a month button is clicked
    $('.month-button').on('click', function() {
        const month = $(this).data('month');
        if (!selectedMonths.includes(month)) {
            selectedMonths.push(month);
            $(this).addClass('active');
        } else {
            selectedMonths = selectedMonths.filter(m => m !== month);
            $(this).removeClass('active');
        }
        applyFilters();
    });

    // Apply filter when a field button is clicked
    $('.field-button').on('click', function() {
        const field = $(this).data('field');
        if (!selectedFields.includes(field)) {
            selectedFields.push(field);
            $(this).addClass('active');
        } else {
            selectedFields = selectedFields.filter(f => f !== field);
            $(this).removeClass('active');
        }
        applyFilters();
    });

    // Search and filter countries
    $('#country-search').on('input', function() {
        const searchValue = $(this).val().toLowerCase();
        $('#country-filter').html('');
        availableCountries.forEach(country => {
            if (country.toLowerCase().includes(searchValue)) {
                const button = `<button type="button" class="btn btn-success country-button" data-country="${country}">${country}</button>`;
                $('#country-filter').append(button);
            }
        });

        // Add event listener for new country buttons
        $('.country-button').on('click', function() {
            const country = $(this).data('country');
            if (!selectedCountries.includes(country)) {
                selectedCountries.push(country);
                $(this).addClass('active');
            } else {
                selectedCountries = selectedCountries.filter(c => c !== country);
                $(this).removeClass('active');
            }
            applyFilters();
        });
    });

    // Update power range when inputs change
    $('#power-min, #power-max').on('input', updatePowerRange);

    // Clear filters functionality
    $('#clearFilters').on('click', function() {
        selectedContinents = [];
        selectedCountries = [];
        selectedMonths = [];
        selectedFields = [];
        selectedPowerMin = 0;
        selectedPowerMax = 3000;
        showFutureEventsOnly = false;
        $('.continent-button').removeClass('active');
        $('.country-button').removeClass('active');
        $('.month-button').removeClass('active');
        $('.field-button').removeClass('active');
        document.getElementById('power-min').value = 0;
        document.getElementById('power-max').value = 3000;
        $('#future-events-checkbox').prop('checked', false);
        $('#selected-filters').html('');
        applyFilters();
    });

    // Toggle future events filter
    $('#future-events-checkbox').on('change', function() {
        showFutureEventsOnly = $(this).is(':checked');
        applyFilters();
    });

    // Remove individual filter
    $(document).on('click', '.filter-item', function() {
        const filterType = $(this).data('type');
        const filterValue = $(this).data('value');
        if (filterType === 'continent') {
            selectedContinents = selectedContinents.filter(c => c !== filterValue);
            $(`.continent-button[data-continent="${filterValue}"]`).removeClass('active');
        } else if (filterType === 'country') {
            selectedCountries = selectedCountries.filter(c => c !== filterValue);
            $(`.country-button[data-country="${filterValue}"]`).removeClass('active');
        } else if (filterType === 'month') {
            selectedMonths = selectedMonths.filter(m => m !== filterValue);
            $(`.month-button[data-month="${filterValue}"]`).removeClass('active');
        } else if (filterType === 'field') {
            selectedFields = selectedFields.filter(f => f !== filterValue);
            $(`.field-button[data-field="${filterValue}"]`).removeClass('active');
        } else if (filterType === 'power') {
            selectedPowerMin = 0;
            selectedPowerMax = 3000;
            document.getElementById('power-min').value = 0;
            document.getElementById('power-max').value = 3000;
        } else if (filterType === 'date') {
            showFutureEventsOnly = false;
            $('#future-events-checkbox').prop('checked', false);
        }
        applyFilters();
    });

    // Function to handle adding selected tournaments to the watchlist
    document.getElementById('addToWatchlist').addEventListener('click', function() {
        let selectedTournaments = [];
        document.querySelectorAll('.select-tournament:checked').forEach(function(checkbox) {
            let row = checkbox.closest('tr');
            let tournament = {
                startDate: row.dataset.startDate,
                endDate: row.dataset.endDate,
                rounds: row.children[2].innerText,
                name: row.dataset.name,
                course: row.children[5].innerText,
                country: row.dataset.country,
                power: row.dataset.power,
                continent: row.dataset.continent,
                field: row.dataset.field
            };
            selectedTournaments.push(tournament);
        });

        // Add selected tournaments to the watchlist table
        let watchlistTableBody = document.getElementById('watchlist-table-body');
        selectedTournaments.forEach(function(tournament) {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${tournament.startDate}</td>
                <td>${tournament.endDate}</td>
                <td>${tournament.rounds}</td>
                <td>${tournament.name}</td>
                <td>${tournament.course}</td>
                <td>${tournament.country}</td>
                <td>${tournament.power}</td>
                <td>${tournament.continent}</td>
		<td>${tournament.field}</td>
            `;
            watchlistTableBody.appendChild(row);
        });

        // Clear checkboxes after adding to watchlist
        document.querySelectorAll('.select-tournament:checked').forEach(function(checkbox) {
            checkbox.checked = false;
        });
    });

    // Populate the table with tournament data
    function populateTournamentTable() {
        const tableBody = document.getElementById('tournament-table-body');
        tournaments.forEach(tournament => {
            const row = document.createElement('tr');
            row.dataset.id = tournament.id;
            row.dataset.continent = tournament.Continent;
            row.dataset.country = tournament.Country;
            row.dataset.startDate = tournament["Start Date"];
            row.dataset.endDate = tournament["End Date"];
            row.dataset.power = tournament["2024 Power"];
            row.dataset.field = tournament.Field;
            row.dataset.name = tournament["Event Name"];

            row.innerHTML = `
                <td><input type="checkbox" class="select-tournament" data-id="${tournament.id}"></td>
                <td>${tournament["Start Date"]}</td>
                <td>${tournament["End Date"]}</td>
                <td>${tournament["# of Rounds"]}</td>
                <td>${tournament["Event Name"]}</td>
                <td>${tournament.Course}</td>
                <td>${tournament.Country}</td>
                <td>${tournament["2024 Power"]}</td>
                <td>${tournament.Continent}</td>
                <td>${tournament.Field}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Populate filter buttons
    function populateFilters() {
        const continentFilter = document.getElementById('continent-filter');
        continents.forEach(continent => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-danger continent-button';
            button.dataset.continent = continent;
            button.textContent = continent;
            continentFilter.appendChild(button);
        });

        const monthFilter = document.getElementById('month-filter');
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        months.forEach(month => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-primary month-button';
            button.dataset.month = month;
            button.textContent = month;
            monthFilter.appendChild(button);
        });

        const fieldFilter = document.getElementById('field-filter');
        const fields = ['Open', 'Amateur', 'Professional'];
        fields.forEach(field => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-purple field-button';
            button.dataset.field = field;
            button.textContent = field;
            fieldFilter.appendChild(button);
        });
    }

    // Initial population of the table and filters
    populateTournamentTable();
    populateFilters();

    // Initial application of filters
    applyFilters();
});