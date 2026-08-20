const address =
    document.getElementById('address');


function openAddress() {

    let value =
        address.value.trim();


    if (!value) {
        return;
    }


    let url;


    if (
        value.startsWith('http://') ||
        value.startsWith('https://')
    ) {

        url = value;

    }

    else if (
        value.includes('.') &&
        !value.includes(' ')
    ) {

        url =
            'https://' + value;

    }

    else {

        url =
            'https://www.google.com/search?q=' +
            encodeURIComponent(value);

    }


    window.open(
        url,
        '_blank'
    );

}


document
    .getElementById('go')
    .addEventListener(
        'click',
        openAddress
    );


address.addEventListener(
    'keydown',
    function(event) {

        if (
            event.key === 'Enter'
        ) {

            openAddress();

        }

    }
);


document
    .querySelectorAll('[data-url]')
    .forEach(
        function(button) {

            button.addEventListener(
                'click',
                function() {

                    window.open(
                        button.dataset.url,
                        '_blank'
                    );

                }
            );

        }
    );