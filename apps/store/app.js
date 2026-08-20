const grid =
    document.getElementById(
        'apps-grid'
    );


APPS.forEach(
    function(app) {

        const card =
            document.createElement(
                'div'
            );


        card.className =
            'app-card';


        card.innerHTML =

            '<img src="' +
                app.icon +
            '">' +

            '<h3>' +
                app.name +
            '</h3>' +

            '<p>' +
                app.category +
            '</p>' +

            '<button class="open-button">' +
                'Open' +
            '</button>';


        card
            .querySelector('.open-button')
            .addEventListener(
                'click',
                function() {

                    /*
                        The Store is inside an iframe.
                        Tell the parent OS to open the app.
                    */

                    window.parent.postMessage({

                        type: 'open-app',

                        appId: app.id

                    }, '*');

                }
            );


        grid.appendChild(
            card
        );

    }
);