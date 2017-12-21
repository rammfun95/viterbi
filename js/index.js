document.addEventListener('DOMContentLoaded',  () => {
    const initForm = document.getElementById('initForm');
    const matrixForm = document.getElementById('matrixForm');
    const resultBlock = document.getElementById('resultBlock');

    const fieldN = document.getElementById('varN');
    const fieldK = document.getElementById('varK');
    const obsField = document.getElementById('obsField');

    const vectorPi = document.getElementById('vectorPi');
    const matrixA = document.getElementById('matrixA');
    const matrixB = document.getElementById('matrixB');

    initForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const N = parseInt(fieldN.value);
        const K = parseInt(fieldK.value);

        vectorPi.innerHTML = generateInputs(K);
        matrixA.innerHTML = generateMatrix(K, K);
        matrixB.innerHTML = generateMatrix(K, N);

        matrixForm.classList.add('is-visible');
        resultBlock.classList.remove('is-visible');
    });

    matrixForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const result = Viterbi(
            getObservations(obsField),
            getInputValues(vectorPi),
            getMatrixValues(matrixA),
            getMatrixValues(matrixB)
        );

        resultBlock.innerText = result;
        resultBlock.classList.add('is-visible');
    });

    const Viterbi = (Y, pi, A, B) => {
        const T = Y.length;
        const K = A.length;
        let X = Array(T).fill(-1);
        let TIndex = getTwoDimensionalArray(K, T, -1);
        let TState = getTwoDimensionalArray(K, T, -1);
        const output = [];

        for (let i = 0; i < K; i++) {
            TState[i][0] = pi[i] * B[i][Y[0]];
            TIndex[i][0] = 0;
            output.push(`TState[${i + 1}, 1] = pi[${i + 1}] * B[${i + 1}, Y[1]]`);
            output.push(`TState[${i + 1}, 1] = ` + TState[i][0].toPrecision(5));
            output.push(`TIndex[${i + 1}, 1] = 0`);
            output.push('');
        }
        output.push("------------------------------");


        for (let i = 1; i < T; i++) {
            for (let j = 0; j < K; j++) {
                let message = `TState[${j + 1}, ${i + 1}] = max(`;
                for (let k = 0; k < K; k++) {
                    const cur = TState[k][i - 1] * A[k][j] * B[j][Y[i]];
                    if (TIndex[j][i] === -1 || cur > TState[j][i]) {
                        TState[j][i] = cur;
                        TIndex[j][i] = k;
                    }
                    message += (k > 0 ? ', ' : '') + cur.toPrecision(5);
                }

                message += ') = ' + TState[j][i].toPrecision(5);
                output.push(`TState[${j + 1}, ${i + 1}] = max k (TState[k, ${i}] * A[k, ${j + 1}] * B[${j + 1}, Y[${i + 1}]]`);
                output.push(message);
                output.push(`TIndex[${j + 1}, ${i + 1}] = argmax k (TState[k, ${i}] * A[k, ${j + 1}] * B[${j + 1}, Y[${i + 1}]]`);
                output.push(`TIndex[${j + 1}, ${i + 1}] = ${TIndex[j][i] + 1}`)
                output.push('');
            }
            output.push("------------------------------");
        }

        output.push('X[T] = argmax k (TState[k, T])');
        output.push('for i = T downto 2')
        output.push('   X[i - 1] = TIndex[X[i], i]');
        output.push("------------------------------");

        for (let k = 0; k < K; k++) {
            if (X[T - 1] === -1 || TState[k][T - 1] > TState[X[T - 1]][T - 1]) {
                X[T - 1] = k;
            }
        }

        for (let i = T - 1; i > 0; i--) {
            X[i - 1] = TIndex[X[i]][i];
        }

        output.push('X = [' + X.map(x => x + 1).join(', ') + ']');

        return output.join('\n');
    };

    const getObservations = (field) => {
        const chars = field.value.trim().toUpperCase().split('');

        return chars.map((char) => {
            return char.charCodeAt(0) - 65;
        });
    };

    const getInputValues = (element) => {
        const result = [];

        [].forEach.call(element.querySelectorAll('input'), (input) => {
            result.push(parseFloat(input.value));
        });

        return result;
    };

    const getMatrixValues = (element) => {
        const matrix = [];

        [].forEach.call(element.querySelectorAll('.matrix-row'), (row) => {
            matrix.push(getInputValues(row));
        });

        return matrix;
    };

    const generateInputs = (count) => {
        return Array(count)
            .fill('<input class="form-control col-sm-3" type="number" step="any" min="0" max="1" required>')
            .join('\n');
    };

    const generateMatrix = (rows, columns) => {
        const rowHtml = [
            '<div class="row matrix-row">',
                '<li></li>',
                generateInputs(columns),
            '</div>'
        ].join('\n');

        const matrixHtml = [
            '<ol>',
                Array(rows).fill(rowHtml).join('\n'),
            '</ol>'
        ].join('\n');

        return matrixHtml;
    };

    const getTwoDimensionalArray = (rows, columns, value) => {
        return Array(rows).fill(0).map(x => Array(columns).fill(value));
        return Array(rows).fill(Array(columns).fill(value));
    };
});
