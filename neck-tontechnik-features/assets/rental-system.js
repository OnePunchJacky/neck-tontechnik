jQuery(document).ready(function($) {
    let currentEquipmentId = null;
    let availableQuantity = 0;
    let rentalCart = [];
    let selectedDates = {
        start: null,
        end: null,
        days: 0
    };
    let allEquipmentItems = [];
    let currentCategory = '';
    let currentSearch = '';
    
    // Set minimum date to today for all date inputs
    const today = new Date().toISOString().split('T')[0];
    $('#cart-rental-start, #cart-rental-end, #rental-start, #rental-end').attr('min', today);
    
    // Initialize equipment items array for filtering
    $('.equipment-item').each(function() {
        allEquipmentItems.push({
            element: $(this),
            id: $(this).data('equipment-id'),
            title: $(this).data('equipment-title').toLowerCase(),
            category: $(this).data('category')
        });
    });
    
    // Date Selection Handler
    $('#cart-rental-start, #cart-rental-end').on('change', function() {
        const startDate = $('#cart-rental-start').val();
        const endDate = $('#cart-rental-end').val();
        
        if (startDate) {
            $('#cart-rental-end').attr('min', startDate);
        }
        
        if (startDate && endDate && startDate > endDate) {
            $('#cart-rental-end').val('');
            return;
        }
        
        // Update selected dates
        if (startDate && endDate) {
            selectedDates.start = startDate;
            selectedDates.end = endDate;
            
            const start = new Date(startDate);
            const end = new Date(endDate);
            const timeDiff = end.getTime() - start.getTime();
            selectedDates.days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            
            updateCartPeriodDisplay();
            updateEquipmentAvailability();
        } else {
            // Reset if dates are incomplete
            selectedDates.start = null;
            selectedDates.end = null;
            selectedDates.days = 0;
            resetEquipmentStatus();
            $('#availability-status').text('Wählen Sie Daten aus, um Verfügbarkeit zu prüfen').removeClass('checking checked');
        }
        
        // Enable/disable cart checkout
        updateCheckoutButton();
    });
    
    function updateEquipmentAvailability() {
        if (!selectedDates.start || !selectedDates.end) {
            return;
        }
        
        // Show checking status
        $('#availability-status')
            .text('Prüfe Verfügbarkeit...')
            .removeClass('checked')
            .addClass('checking');
        
        // Collect all visible equipment IDs
        const equipmentIds = [];
        $('.equipment-item:visible').each(function() {
            equipmentIds.push($(this).data('equipment-id'));
        });
        
        if (equipmentIds.length === 0) {
            $('#availability-status')
                .text('Keine Ausrüstung zu prüfen')
                .removeClass('checking checked');
            return;
        }
        
        $.ajax({
            url: rental_ajax.ajaxurl,
            type: 'POST',
            data: {
                action: 'update_equipment_availability_status',
                nonce: rental_ajax.nonce,
                start_date: selectedDates.start,
                end_date: selectedDates.end,
                equipment_ids: equipmentIds
            },
            success: function(response) {
                if (response.success) {
                    const data = response.data;
                    
                    // Update status header
                    $('#availability-status')
                        .html(`<strong>${data.status_summary}</strong><br>${data.period_info}`)
                        .removeClass('checking')
                        .addClass('checked');
                    
                    // Update each equipment item
                    Object.keys(data.equipment_status).forEach(function(equipmentId) {
                        const status = data.equipment_status[equipmentId];
                        updateEquipmentItemStatus(equipmentId, status);
                    });
                    
                    // Update cart period display
                    updateCartPeriodDisplay();
                    
                } else {
                    $('#availability-status')
                        .text('Fehler beim Prüfen der Verfügbarkeit: ' + (response.data.message || 'Unbekannter Fehler'))
                        .removeClass('checking checked');
                }
            },
            error: function() {
                $('#availability-status')
                    .text('Fehler beim Prüfen der Verfügbarkeit. Bitte versuchen Sie es erneut.')
                    .removeClass('checking checked');
            }
        });
    }
    
    function updateEquipmentItemStatus(equipmentId, status) {
        const equipmentItem = $(`.equipment-item[data-equipment-id="${equipmentId}"]`);
        
        // Update status badge
        const statusBadge = equipmentItem.find('.status-badge');
        statusBadge
            .removeClass('status-unknown status-available status-limited status-unavailable')
            .addClass(status.status_class)
            .text(status.status_text);
        
        // Update period availability text
        equipmentItem.find('.period-available')
            .text(status.period_text)
            .show();
        
        // Update quantity selector and add to cart button
        const quantityInput = equipmentItem.find('.quantity-input');
        const addToCartBtn = equipmentItem.find('.add-to-cart-btn');
        
        if (status.available_units > 0) {
            // Available - enable controls
            equipmentItem.removeClass('unavailable');
            quantityInput
                .attr('max', status.available_units)
                .prop('disabled', false);
            addToCartBtn
                .prop('disabled', false)
                .show();
            equipmentItem.find('.quantity-selector').show();
        } else {
            // Unavailable - disable controls
            equipmentItem.addClass('unavailable');
            quantityInput
                .attr('max', 0)
                .val(0)
                .prop('disabled', true);
            addToCartBtn
                .prop('disabled', true)
                .hide();
            equipmentItem.find('.quantity-selector').hide();
        }
        
        // Update data attributes for cart functionality
        equipmentItem.attr('data-available', status.available_units);
    }
    
    function resetEquipmentStatus() {
        $('.equipment-item').each(function() {
            const equipmentItem = $(this);
            
            // Reset status badge
            equipmentItem.find('.status-badge')
                .removeClass('status-available status-limited status-unavailable')
                .addClass('status-unknown')
                .text('Datum wählen');
            
            // Hide period availability
            equipmentItem.find('.period-available').hide();
            
            // Hide and disable controls
            equipmentItem.removeClass('unavailable');
            equipmentItem.find('.quantity-selector').hide();
            equipmentItem.find('.add-to-cart-btn').hide().prop('disabled', true);
            equipmentItem.find('.quantity-input').val(0).prop('disabled', true);
        });
    }
    
    function updateCartPeriodDisplay() {
        if (selectedDates.start && selectedDates.end) {
            const startFormatted = new Date(selectedDates.start).toLocaleDateString('de-DE');
            const endFormatted = new Date(selectedDates.end).toLocaleDateString('de-DE');
            
            $('#cart-period-display').text(`${startFormatted} - ${endFormatted}`);
            $('#cart-duration-display').text(`${selectedDates.days} Tag${selectedDates.days === 1 ? '' : 'e'}`);
        } else {
            $('#cart-period-display').text('Bitte Datum wählen');
            $('#cart-duration-display').text('');
        }
    }
    
    // Category Filter Handler
    $('.category-filter').on('click', function() {
        const category = $(this).data('category');
        
        $('.category-filter').removeClass('active');
        $(this).addClass('active');
        
        currentCategory = category;
        applyFilters();
    });
    
    // Search Handler
    $('#equipment-search').on('input', function() {
        currentSearch = $(this).val().toLowerCase().trim();
        applyFilters();
    });
    
    $('#search-btn').on('click', function() {
        applyFilters();
    });
    
    function applyFilters() {
        let visibleCount = 0;
        
        allEquipmentItems.forEach(function(item) {
            let visible = true;
            
            // Category filter
            if (currentCategory && item.category !== currentCategory) {
                visible = false;
            }
            
            // Search filter
            if (currentSearch && !item.title.includes(currentSearch)) {
                visible = false;
            }
            
            if (visible) {
                item.element.show();
                visibleCount++;
            } else {
                item.element.hide();
            }
        });
        
        // Update availability after filtering if dates are selected
        if (selectedDates.start && selectedDates.end) {
            updateEquipmentAvailability();
        }
        
        // Update status message
        if (visibleCount === 0) {
            $('#availability-status').text('Keine Artikel entsprechen den Filterkriterien').removeClass('checking checked');
        } else if (!selectedDates.start || !selectedDates.end) {
            $('#availability-status').text('Wählen Sie Daten aus, um Verfügbarkeit zu prüfen').removeClass('checking checked');
        }
    }
    
    // Shopping Cart Functions
    function updateCartDisplay() {
        const cartCount = rentalCart.reduce((total, item) => total + item.quantity, 0);
        $('.cart-count').text(cartCount);
        
        if (cartCount > 0) {
            $('#rental-cart').show();
        } else {
            $('#rental-cart').hide();
        }
        
        // Update cart items display
        let cartItemsHtml = '';
        
        rentalCart.forEach((item, index) => {
            cartItemsHtml += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-quantity">${item.quantity}x</div>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">×</button>
                </div>
            `;
        });
        
        $('#cart-items').html(cartItemsHtml);
        updateCartTotal();
        updateCheckoutButton();
    }
    
    function updateCartTotal() {
        if (!selectedDates.start || !selectedDates.end || rentalCart.length === 0) {
            $('#cart-total-price').text('€0.00');
            return;
        }
        
        calculateMultiPrice(selectedDates.start, selectedDates.end);
    }
    
    function updateCheckoutButton() {
        const hasItems = rentalCart.length > 0;
        const hasDates = selectedDates.start && selectedDates.end;
        
        $('#proceed-checkout').prop('disabled', !hasItems || !hasDates);
    }
    
    function addToCart(equipmentId, quantity) {
        const equipmentItem = $(`.equipment-item[data-equipment-id="${equipmentId}"]`);
        const title = equipmentItem.data('equipment-title');
        const dailyRate = parseFloat(equipmentItem.data('daily-rate')) || 0;
        const weekendRate = parseFloat(equipmentItem.data('weekend-rate')) || 0;
        const weeklyRate = parseFloat(equipmentItem.data('weekly-rate')) || 0;
        const monthlyRate = parseFloat(equipmentItem.data('monthly-rate')) || 0;
        const deposit = parseFloat(equipmentItem.data('deposit')) || 0;
        const available = parseInt(equipmentItem.data('available'));
        
        // Check if item already exists in cart
        const existingIndex = rentalCart.findIndex(item => item.equipmentId == equipmentId);
        
        if (existingIndex !== -1) {
            const newQuantity = rentalCart[existingIndex].quantity + quantity;
            if (newQuantity <= available) {
                rentalCart[existingIndex].quantity = newQuantity;
            } else {
                showMessage(`Nur ${available} Stück verfügbar für den gewählten Zeitraum.`, 'error');
                return;
            }
        } else {
            if (quantity <= available) {
                rentalCart.push({
                    equipmentId: equipmentId,
                    title: title,
                    quantity: quantity,
                    dailyRate: dailyRate,
                    weekendRate: weekendRate,
                    weeklyRate: weeklyRate,
                    monthlyRate: monthlyRate,
                    deposit: deposit,
                    available: available
                });
            } else {
                showMessage(`Nur ${available} Stück verfügbar für den gewählten Zeitraum.`, 'error');
                return;
            }
        }
        
        updateCartDisplay();
        
        // Reset quantity input
        $(`#qty-${equipmentId}`).val(0);
        
        showMessage(`${title} wurde zum Warenkorb hinzugefügt.`, 'success');
    }
    
    function removeFromCart(index) {
        const removedItem = rentalCart[index];
        rentalCart.splice(index, 1);
        updateCartDisplay();
        showMessage(`${removedItem.title} wurde aus dem Warenkorb entfernt.`, 'success');
    }
    
    function clearCart() {
        rentalCart = [];
        updateCartDisplay();
        showMessage('Warenkorb wurde geleert.', 'success');
    }
    
    function calculateMultiPrice(startDate, endDate) {
        if (rentalCart.length === 0) {
            $('#cart-total-price').text('€0.00');
            return;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        // Check if it's a weekend rental (Friday-Sunday)
        let isWeekend = false;
        if (days == 3 && start.getDay() == 5 && end.getDay() == 0) {
            // Friday to Sunday
            isWeekend = true;
        } else if (days == 2 && (
            (start.getDay() == 5 && end.getDay() == 6) || // Friday-Saturday
            (start.getDay() == 6 && end.getDay() == 0) || // Saturday-Sunday
            (start.getDay() == 5 && end.getDay() == 0)    // Friday-Sunday (2 days)
        )) {
            isWeekend = true;
        }
        
        let totalRentalPrice = 0;
        let totalDepositPrice = 0;
        let breakdown = [];
        
        rentalCart.forEach(item => {
            let itemRentalPrice = 0;
            let itemDepositPrice = item.deposit * item.quantity;
            
            // Calculate best pricing based on duration
            if (days >= 28 && item.monthlyRate > 0) {
                const months = Math.ceil(days / 28);
                itemRentalPrice = item.monthlyRate * months * item.quantity;
                breakdown.push(`${item.title} (${item.quantity}x): ${months} Monat(e) × €${item.monthlyRate.toFixed(2)} = €${itemRentalPrice.toFixed(2)}`);
            } else if (days >= 7 && item.weeklyRate > 0) {
                const weeks = Math.ceil(days / 7);
                itemRentalPrice = item.weeklyRate * weeks * item.quantity;
                breakdown.push(`${item.title} (${item.quantity}x): ${weeks} Woche(n) × €${item.weeklyRate.toFixed(2)} = €${itemRentalPrice.toFixed(2)}`);
            } else if (isWeekend && item.weekendRate > 0) {
                itemRentalPrice = item.weekendRate * item.quantity;
                breakdown.push(`${item.title} (${item.quantity}x): Wochenende × €${item.weekendRate.toFixed(2)} = €${itemRentalPrice.toFixed(2)}`);
            } else {
                itemRentalPrice = item.dailyRate * days * item.quantity;
                breakdown.push(`${item.title} (${item.quantity}x): ${days} Tag(e) × €${item.dailyRate.toFixed(2)} = €${itemRentalPrice.toFixed(2)}`);
            }
            
            if (item.deposit > 0) {
                breakdown.push(`${item.title} Kaution: €${item.deposit.toFixed(2)} × ${item.quantity} = €${itemDepositPrice.toFixed(2)}`);
            }
            
            totalRentalPrice += itemRentalPrice;
            totalDepositPrice += itemDepositPrice;
        });
        
        const grandTotal = totalRentalPrice + totalDepositPrice;
        
        $('#cart-total-price').text(`€${grandTotal.toFixed(2)}`);
        
        // Store breakdown for checkout
        window.currentPriceBreakdown = breakdown;
        window.currentTotalPrice = grandTotal;
    }
    
    // Cart Event Handlers
    $(document).on('click', '.add-to-cart-btn', function() {
        if (!selectedDates.start || !selectedDates.end) {
            showMessage('Bitte wählen Sie zuerst einen Mietzeitraum aus.', 'error');
            return;
        }
        
        const equipmentId = $(this).data('equipment-id');
        const quantity = parseInt($(`#qty-${equipmentId}`).val()) || 0;
        
        if (quantity > 0) {
            addToCart(equipmentId, quantity);
        } else {
            showMessage('Bitte geben Sie eine Anzahl größer als 0 ein.', 'error');
        }
    });
    
    $(document).on('click', '.cart-item-remove', function() {
        const index = $(this).data('index');
        removeFromCart(index);
    });
    
    $('#clear-cart').on('click', function() {
        clearCart();
    });
    
    // Toggle cart visibility (for mobile)
    $('#toggle-cart').on('click', function() {
        const cartContent = $('.cart-content');
        cartContent.toggle();
    });
    
    // Proceed to Checkout
    $('#proceed-checkout').on('click', function() {
        if (rentalCart.length === 0) {
            showMessage('Ihr Warenkorb ist leer.', 'error');
            return;
        }
        
        if (!selectedDates.start || !selectedDates.end) {
            showMessage('Mietzeitraum fehlt.', 'error');
            return;
        }
        
        // Store cart data in localStorage for checkout page
        const checkoutData = {
            cart: rentalCart,
            dates: selectedDates,
            priceBreakdown: window.currentPriceBreakdown || [],
            totalPrice: window.currentTotalPrice || 0
        };
        
        localStorage.setItem('equipmentCheckoutData', JSON.stringify(checkoutData));
        
        // Navigate to checkout page
        window.location.href = '/checkout/';
    });
    
    // Checkout Page Functionality (existing code unchanged)
    if ($('.equipment-checkout').length > 0) {
        initializeCheckoutPage();
    }
    
    function initializeCheckoutPage() {
        const checkoutData = localStorage.getItem('equipmentCheckoutData');
        
        if (!checkoutData) {
            $('#checkout-empty').show();
            return;
        }
        
        try {
            const data = JSON.parse(checkoutData);
            
            if (!data.cart || data.cart.length === 0) {
                $('#checkout-empty').show();
                return;
            }
            
            $('#checkout-loading').show();
            
            // Populate checkout sections
            populateCheckoutPeriod(data.dates);
            populateCheckoutEquipment(data.cart);
            populateCheckoutPricing(data.priceBreakdown, data.totalPrice);
            
            // Set hidden form fields
            $('#checkout-cart-data').val(JSON.stringify(data.cart));
            $('#checkout-rental-start').val(data.dates.start);
            $('#checkout-rental-end').val(data.dates.end);
            
            $('#checkout-loading').hide();
            $('#checkout-content').show();
            
        } catch (e) {
            console.error('Error loading checkout data:', e);
            $('#checkout-empty').show();
        }
    }
    
    function populateCheckoutPeriod(dates) {
        const startFormatted = new Date(dates.start).toLocaleDateString('de-DE');
        const endFormatted = new Date(dates.end).toLocaleDateString('de-DE');
        
        $('#checkout-period-summary').html(`
            <div class="period-summary">
                <div class="period-dates">${startFormatted} - ${endFormatted}</div>
                <div class="period-duration">${dates.days} Tag${dates.days === 1 ? '' : 'e'}</div>
            </div>
        `);
    }
    
    function populateCheckoutEquipment(cart) {
        let equipmentHtml = '';
        
        cart.forEach(item => {
            equipmentHtml += `
                <div class="equipment-item-checkout">
                    <div class="item-info">
                        <div class="item-title">${item.title}</div>
                        <div class="item-details">
                            Tagesmiete: €${item.dailyRate.toFixed(2)} | 
                            Kaution: €${item.deposit.toFixed(2)}
                        </div>
                    </div>
                    <div class="item-quantity">${item.quantity}x</div>
                </div>
            `;
        });
        
        $('#checkout-equipment-list').html(equipmentHtml);
    }
    
    function populateCheckoutPricing(breakdown, total) {
        let breakdownHtml = '';
        
        breakdown.forEach(item => {
            const isDeposit = item.includes('Kaution');
            breakdownHtml += `
                <div class="price-breakdown-item ${isDeposit ? 'deposit' : ''}">
                    <span>${item.split('=')[0].trim()}</span>
                    <span>${item.split('=')[1].trim()}</span>
                </div>
            `;
        });
        
        $('#checkout-price-breakdown').html(breakdownHtml);
        $('#checkout-total-price').text(`€${total.toFixed(2)}`);
    }
    
    // Checkout Form Handlers
    $('#back-to-cart').on('click', function() {
        history.back();
    });
    
    $('#checkout-form').on('submit', function(e) {
        e.preventDefault();
        
        if (!validateCheckoutForm()) {
            showMessage('Bitte füllen Sie alle Pflichtfelder aus.', 'error');
            return;
        }
        
        const submitBtn = $('#submit-checkout');
        const originalText = submitBtn.text();
        submitBtn.prop('disabled', true).text('Sende Anfrage...');
        
        const formData = {
            action: 'multi_rental_request',
            nonce: rental_ajax.nonce,
            customer_name: $('#checkout-customer-name').val(),
            customer_email: $('#checkout-customer-email').val(),
            customer_phone: $('#checkout-customer-phone').val(),
            customer_company: $('#checkout-customer-company').val(),
            rental_start: $('#checkout-rental-start').val(),
            rental_end: $('#checkout-rental-end').val(),
            customer_message: $('#checkout-customer-message').val(),
            cart_data: $('#checkout-cart-data').val()
        };
        
        $.ajax({
            url: rental_ajax.ajaxurl,
            type: 'POST',
            data: formData,
            success: function(response) {
                if (response.success) {
                    // Clear checkout data
                    localStorage.removeItem('equipmentCheckoutData');
                    
                    // Show success and redirect
                    showMessage(response.data.message, 'success');
                    
                    setTimeout(function() {
                        window.location.href = '/';
                    }, 3000);
                } else {
                    showMessage(response.data.message || 'Ein Fehler ist aufgetreten.', 'error');
                }
            },
            error: function() {
                showMessage('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
            },
            complete: function() {
                submitBtn.prop('disabled', false).text(originalText);
            }
        });
    });
    
    function validateCheckoutForm() {
        const requiredFields = ['checkout-customer-name', 'checkout-customer-email'];
        let isValid = true;
        
        requiredFields.forEach(function(fieldId) {
            const field = $('#' + fieldId);
            const value = field.val();
            
            if (!value || value.trim() === '') {
                field.addClass('error');
                isValid = false;
            } else {
                field.removeClass('error');
            }
        });
        
        // Validate email
        const email = $('#checkout-customer-email').val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            $('#checkout-customer-email').addClass('error');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Handle single item rental request button clicks (existing functionality)
    $('.rental-request-btn').on('click', function() {
        currentEquipmentId = $(this).data('equipment-id');
        const equipmentItem = $(this).closest('.equipment-item');
        const equipmentTitle = equipmentItem.find('.equipment-title').text();
        availableQuantity = parseInt(equipmentItem.find('.availability-count').text().split(' ')[0]);
        
        // Set equipment ID in form
        $('#equipment-id').val(currentEquipmentId);
        
        // Update modal title
        $('#rental-modal h2').text('Mietanfrage - ' + equipmentTitle);
        
        // Set max quantity
        $('#quantity').attr('max', availableQuantity);
        $('#quantity').val(1);
        
        // Reset form
        $('#rental-request-form')[0].reset();
        $('#equipment-id').val(currentEquipmentId);
        $('#quantity').val(1);
        $('#price-breakdown').empty();
        $('#total-price').text('€0.00');
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        $('#rental-start').attr('min', today);
        $('#rental-end').attr('min', today);
        
        // Show modal
        $('#rental-modal').show();
    });
    
    // Close modal
    $('.close-modal, .cancel-btn').on('click', function() {
        $('.rental-modal').hide();
    });
    
    // Close modal when clicking outside
    $('.rental-modal').on('click', function(e) {
        if (e.target === this) {
            $(this).hide();
        }
    });
    
    // Update end date minimum when start date changes
    $('#rental-start').on('change', function() {
        const startDate = $(this).val();
        $('#rental-end').attr('min', startDate);
        
        // If end date is before start date, clear it
        const endDate = $('#rental-end').val();
        if (endDate && endDate < startDate) {
            $('#rental-end').val('');
        }
        
        calculatePrice();
    });
    
    // Calculate price when dates or quantity change
    $('#rental-end, #quantity').on('change', function() {
        calculatePrice();
    });
    
    // Price calculation function (single item)
    function calculatePrice() {
        const startDate = $('#rental-start').val();
        const endDate = $('#rental-end').val();
        const quantity = parseInt($('#quantity').val()) || 1;
        
        if (!startDate || !endDate || !currentEquipmentId) {
            $('#price-breakdown').empty();
            $('#total-price').text('€0.00');
            return;
        }
        
        // Show loading
        $('#price-breakdown').html('<div>Berechne Preis...</div>');
        
        $.ajax({
            url: rental_ajax.ajaxurl,
            type: 'POST',
            data: {
                action: 'calculate_rental_price',
                nonce: rental_ajax.nonce,
                equipment_id: currentEquipmentId,
                start_date: startDate,
                end_date: endDate,
                quantity: quantity
            },
            success: function(response) {
                if (response.success) {
                    const data = response.data;
                    
                    // Update price breakdown
                    let breakdownHtml = '';
                    data.breakdown.forEach(function(item) {
                        breakdownHtml += '<div>' + item + '</div>';
                    });
                    
                    $('#price-breakdown').html(breakdownHtml);
                    $('#total-price').text('€' + data.total_price.toFixed(2));
                } else {
                    $('#price-breakdown').html('<div>Fehler bei der Preisberechnung</div>');
                    $('#total-price').text('€0.00');
                }
            },
            error: function() {
                $('#price-breakdown').html('<div>Fehler bei der Preisberechnung</div>');
                $('#total-price').text('€0.00');
            }
        });
    }
    
    // Form validation (existing)
    function validateForm() {
        const requiredFields = ['customer_name', 'customer_email', 'rental_start', 'rental_end', 'quantity'];
        let isValid = true;
        
        // Remove previous error styling
        $('.form-group input, .form-group textarea').removeClass('error');
        
        requiredFields.forEach(function(field) {
            const value = $('[name="' + field + '"]').val();
            if (!value || value.trim() === '') {
                $('[name="' + field + '"]').addClass('error');
                isValid = false;
            }
        });
        
        // Validate email
        const email = $('#customer-email').val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            $('#customer-email').addClass('error');
            isValid = false;
        }
        
        // Validate dates
        const startDate = new Date($('#rental-start').val());
        const endDate = new Date($('#rental-end').val());
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
            $('#rental-start').addClass('error');
            isValid = false;
        }
        
        if (endDate < startDate) {
            $('#rental-end').addClass('error');
            isValid = false;
        }
        
        // Validate quantity
        const quantity = parseInt($('#quantity').val());
        if (quantity < 1 || quantity > availableQuantity) {
            $('#quantity').addClass('error');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Handle single form submission
    $('#rental-request-form').on('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            showMessage('Bitte füllen Sie alle Pflichtfelder korrekt aus.', 'error');
            return;
        }
        
        const submitBtn = $('.submit-btn');
        const originalText = submitBtn.text();
        
        // Show loading state
        submitBtn.prop('disabled', true).text('Sende Anfrage...');
        
        // Collect form data
        const formData = {
            action: 'rental_request',
            nonce: rental_ajax.nonce,
            equipment_id: currentEquipmentId,
            customer_name: $('#customer-name').val(),
            customer_email: $('#customer-email').val(),
            customer_phone: $('#customer-phone').val(),
            rental_start: $('#rental-start').val(),
            rental_end: $('#rental-end').val(),
            quantity: $('#quantity').val(),
            customer_message: $('#customer-message').val()
        };
        
        $.ajax({
            url: rental_ajax.ajaxurl,
            type: 'POST',
            data: formData,
            success: function(response) {
                if (response.success) {
                    showMessage(response.data.message, 'success');
                    $('#rental-modal').hide();
                    
                    // Reset form
                    $('#rental-request-form')[0].reset();
                } else {
                    showMessage(response.data.message || 'Ein Fehler ist aufgetreten.', 'error');
                }
            },
            error: function() {
                showMessage('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
            },
            complete: function() {
                // Reset button state
                submitBtn.prop('disabled', false).text(originalText);
            }
        });
    });
    
    // Show message function
    function showMessage(message, type) {
        // Remove existing messages
        $('.message').remove();
        
        const messageHtml = '<div class="message ' + type + '">' + message + '</div>';
        
        // Add message to appropriate location
        if ($('.rental-modal:visible').length > 0) {
            $('.rental-modal:visible .modal-content').prepend(messageHtml);
        } else if ($('.equipment-checkout').length > 0) {
            $('.equipment-checkout').prepend(messageHtml);
        } else if ($('.rental-system-container').length > 0) {
            $('.rental-system-container').before(messageHtml);
        } else {
            $('.equipment-catalog').first().before(messageHtml);
        }
        
        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(function() {
                $('.message.success').fadeOut(function() {
                    $(this).remove();
                });
            }, 5000);
        }
        
        // Scroll to message
        if ($('.rental-modal:visible').length === 0) {
            $('html, body').animate({
                scrollTop: $('.message').offset().top - 100
            }, 500);
        }
    }
    
    // Add error styling for form validation
    $('<style>')
        .text('.form-group input.error, .form-group textarea.error { border-color: #dc3545; box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2); }')
        .appendTo('head');
    
    // Remove error styling when user starts typing
    $(document).on('input', '.form-group input, .form-group textarea', function() {
        $(this).removeClass('error');
    });
    
    // Handle keyboard navigation
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('.rental-modal:visible').length > 0) {
            $('.rental-modal').hide();
        }
    });
    
    // Phone number formatting
    $('#customer-phone, #checkout-customer-phone').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 11) {
                if (value.startsWith('49')) {
                    value = '+' + value.substring(0, 2) + ' ' + value.substring(2);
                } else if (value.startsWith('0')) {
                    value = value.substring(0, 4) + ' ' + value.substring(4);
                }
            }
        }
        $(this).val(value);
    });
    
    // Email validation styling
    $('#customer-email, #checkout-customer-email').on('blur', function() {
        const email = $(this).val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            $(this).addClass('error');
        } else {
            $(this).removeClass('error');
        }
    });
    
    // Quantity validation for single form
    $('#quantity').on('input', function() {
        const quantity = parseInt($(this).val());
        const max = parseInt($(this).attr('max'));
        
        if (quantity > max) {
            $(this).val(max);
            showMessage('Maximal ' + max + ' Stück verfügbar.', 'error');
        } else if (quantity < 1) {
            $(this).val(1);
        }
        
        calculatePrice();
    });
    
    // Quantity validation for cart inputs
    $(document).on('input', '.quantity-input', function() {
        const quantity = parseInt($(this).val());
        const max = parseInt($(this).attr('max'));
        
        if (quantity > max) {
            $(this).val(max);
            showMessage('Maximal ' + max + ' Stück verfügbar für den gewählten Zeitraum.', 'error');
        } else if (quantity < 0) {
            $(this).val(0);
        }
    });
}); 