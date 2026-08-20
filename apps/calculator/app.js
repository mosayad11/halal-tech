const display =
    document.getElementById('display');


let expression = '';


document
    .querySelectorAll('[data-value]')
    .forEach(
        function(button) {

            button.addEventListener(
                'click',
                function() {

                    const value =
                        button.dataset.value;


                    if (value === 'C') {

                        expression = '';

                        display.value =
                            '0';

                        return;

                    }


                    if (value === '=') {

                        try {

                            const result =
                                Function(
                                    'return ' +
                                    expression
                                )();

                            expression =
                                String(result);

                            display.value =
                                expression;

                        }

                        catch {

                            expression = '';

                            display.value =
                                'Error';

                        }

                        return;

                    }


                    expression +=
                        value;

                    display.value =
                        expression;

                }
            );

        }
    );


document.addEventListener(
    'keydown',
    function(event) {

        if (
            /^[0-9+\-*/().]$/
                .test(event.key)
        ) {

            expression +=
                event.key;

            display.value =
                expression;

        }


        if (
            event.key === 'Enter'
        ) {

            document
                .querySelector(
                    '[data-value="="]'
                )
                .click();

        }


        if (
            event.key === 'Escape'
        ) {

            document
                .querySelector(
                    '[data-value="C"]'
                )
                .click();

        }

    }
);