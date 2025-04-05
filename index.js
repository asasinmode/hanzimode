/**
 *  @typedef IHanzi
 *  @type {object}
 *  @property {string} symbol hanzi symbol
 *  @property {string} pinyin pinyin transcription of the hanzi
 *  @property {string} meaning hanzi meaning
 *  @property {string|undefined} note optional note
 */

/**
 *  @typedef IData
 *  @type {object}
 *  @property {number} version data version
 *  @property {IHanzi[]} hanzi saved hanzi
 */

/**
 * @typedef IHanziKey
 * @type {'symbol'|'pinyin'|'meaning'}
 */

/**
 * @typedef ITarget
 * @type {object}
 * @property {IHanzi} hanzi current hanzi
 * @property {IHanziKey} type the displayed target
 */

/** @type {IData} */
let data = { version: '1', hanzi: [] };
let isShowingData = false;

let isLooping = false;
/** @type {IHanzi[]} */
let toBeLooped = [];
/** @type {string[]} */
let loopedThrough = [];
/** @type {ITarget|undefined} */
let currentTarget;
/** @type {number} */
let fieldset1CorrectIndex;
/** @type {number} */
let fieldset2CorrectIndex;

const GUESS_OPTIONS_NUMBER = 4;
const allTargets = ['symbol', 'pinyin', 'meaning'];
const allowedTargets = ['symbol', 'pinyin', 'meaning'];

const _version = localStorage.getItem('hanzimode.version');
if (!_version) {
	console.warn('no version detected, won\'t try reading stored data');
	localStorage.setItem('hanzimode.version', data.version);
} else if (_version !== data.version) {
	alert('mismatched versions');
} else {
	const _hanzi = localStorage.getItem('hanzimode.data');
	if (_hanzi) {
		try {
			data.hanzi = JSON.parse(_hanzi);
		} catch (error) {
			console.error('failed to parse stored data');
			console.error(error);
		}
	}
}

updateLoopStatus();
function updateLoopStatus() {
	document.getElementById('loopStatus').textContent = isLooping
		? `${loopedThrough.length + 1} / ${data.hanzi.length}`
		: data.hanzi.length;
}

function saveData() {
	localStorage.setItem('hanzimode.data', JSON.stringify(data.hanzi));
	localStorage.setItem('hanzimode.version', data.version);
}

/**
	* @param {SubmitEvent} event
	*/
function addItem(event) {
	event.preventDefault();
	/** @type {[HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLTextAreaElement]} */
	const [symbolInput, pinyinInput, meaningInput, noteInput] = event.target;

	const item = {
		symbol: symbolInput.value.trim(),
		pinyin: pinyinInput.value.trim(),
		meaning: meaningInput.value.trim(),
		note: noteInput.value.trim(),
	};

	const index = data.hanzi.findIndex(h => h.symbol === item.symbol);
	const addNew = index === -1;
	if (addNew) {
		data.hanzi.push(item);
		updateLoopStatus();
	} else {
		data.hanzi.splice(index, 1, item);
	}
	saveData();

	if (isShowingData) {
		if (addNew) {
			addDataRow(document.getElementById('dataTable').children.item(1), item);
		} else {
			const row = document.getElementById(`data-${item.symbol}`);
			row.children.item(1).textContent = item.pinyin;
			row.children.item(2).textContent = item.meaning;
			row.children.item(3).textContent = item.note;
		}
	}

	symbolInput.value = '';
	pinyinInput.value = '';
	meaningInput.value = '';
	noteInput.value = '';
}

/**
	* @param {Event} event
	*/
function toggleData(event) {
	if (isShowingData) {
		const table = document.getElementById('dataTable');
		const thead = table.firstElementChild.cloneNode(true);
		table.style.display = 'none';
		table.innerHTML = '';
		table.appendChild(thead);
		event.target.textContent = 'show data';
	} else {
		showData();
		event.target.textContent = 'hide data';
	}
	isShowingData = !isShowingData;
}

function showData() {
	const table = document.getElementById('dataTable');
	table.style.display = '';

	const tbody = document.createElement('tbody');
	for (const item of data.hanzi) {
		addDataRow(tbody, item);
	}
	table.appendChild(tbody);
}

/**
 * @param {HTMLTableSectionElement} tbody
 * @param {IHanzi} hanzi
 */
function addDataRow(tbody, { symbol, pinyin, meaning, note }) {
	const row = Object.assign(document.createElement('tr'), { id: `data-${symbol}` });

	for (const property of [symbol, pinyin, meaning, note]) {
		const cell = Object.assign(document.createElement('td'), { textContent: property });
		row.appendChild(cell);
	}

	const actionsCell = document.createElement('td');
	const editButton = Object.assign(document.createElement('button'), { textContent: 'edit' });
	editButton.addEventListener('click', () => {
		document.getElementById('dataForm').scrollIntoView();
		const item = data.hanzi.find(h => h.symbol === symbol);
		document.getElementById('dataInputSymbol').value = item.symbol;
		document.getElementById('dataInputPinyin').value = item.pinyin;
		document.getElementById('dataInputMeaning').value = item.meaning;
		document.getElementById('dataInputNote').value = item.note;
	});
	actionsCell.appendChild(editButton);

	const deleteButton = Object.assign(document.createElement('button'), { textContent: 'delete' });
	deleteButton.addEventListener('click', () => {
		const proceed = confirm(`delete ${symbol}`);
		if (proceed) {
			const index = data.hanzi.findIndex(item => item.symbol === symbol);
			if (~index) {
				data.hanzi.splice(index, 1);
				saveData();
				row.remove();
				updateLoopStatus();
			}
		}
	});
	actionsCell.appendChild(deleteButton);
	row.appendChild(actionsCell);

	tbody.appendChild(row);
}

function exportData() {
	const content = JSON.stringify(data);
	const blob = new Blob([content], { type: 'application/json' });
	const href = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement('a'), {
		href,
		download: 'hanzimode.json',
	});
	a.click();
	URL.revokeObjectURL(href);
}

/** @param {InputEvent} event */
async function importData(event) {
	const [file] = event.target.files;
	if (file) {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				/** @type IData */
				const parsed = JSON.parse(reader.result);
				if (!parsed.version) {
					throw new Error('no version', reader.result);
				} else if (parsed.version !== data.version) {
					throw new Error('mismatched version');
				} else if (!parsed.hanzi || !Array.isArray(parsed.hanzi)) {
					throw new Error('invalid hanzi');
				}
				data = parsed;

				if (isShowingData) {
					document.getElementById('dataTable').remove();
					showData();
				}

				saveData();
				stopLoop();
				event.target.value = '';
			} catch (e) {
				console.error(e);
				alert(e);
			}
		};
		reader.onerror = () => {
			console.error('reader error', reader.error);
			alert('failed to read file');
		};
		reader.readAsText(file);
	}
}

/** @param {Event} event target is startOrResetLoop btn */
function startOrResetLoop(event) {
	if (isLooping) {
		if (toBeLooped.length <= 1 || confirm('are you sure?')) {
			stopLoop();
		}
		return;
	} else {
		if (data.hanzi.length < 5) {
			alert('at least 5 items have to be in the collection');
			return;
		}
		event.target.textContent = 'reset loop';
	}

	isLooping = true;
	loopedThrough = [];
	toBeLooped = [...data.hanzi];
	for (let i = toBeLooped.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[toBeLooped[i], toBeLooped[j]] = [toBeLooped[j], toBeLooped[i]];
	}

	clearCanvas();

	document.body.classList.add('looping');

	updateLoopStatus();
	nextTarget();
	onResize();
}

function stopLoop() {
	isLooping = false;
	loopedThrough = [];
	toBeLooped = [];
	currentTarget = undefined;

	document.getElementById('startOrResetLoop').textContent = 'start loop';
	document.getElementById('nextTarget').removeAttribute('disabled');
	document.body.classList.remove('looping');
	resetFieldsets();

	updateLoopStatus();
}

/** @param {string} type */
function targetTypeLabel(type) {
	return type === 'symbol' ? 'hànzì' : type;
}

function nextTarget() {
	if (data.hanzi.length < 5) {
		alert('at least 5 items have to be in the collection');
		throw new Error('at least 5 items have to be in the collection');
	}

	if (currentTarget) {
		loopedThrough.push(currentTarget.hanzi.symbol);
		toBeLooped.pop();

		if (toBeLooped.length === 1) {
			document.getElementById('nextTarget').setAttribute('disabled', 'true');
		}
	}

	currentTarget = { hanzi: toBeLooped[toBeLooped.length - 1] };
	currentTarget.type = allowedTargets[Math.floor(Math.random() * allowedTargets.length)];
	const inputTypes = allTargets.filter(target => target !== currentTarget.type);

	hideTargetNote();
	resetFieldsets();
	clearCanvas();
	document.getElementById('loopTarget').textContent = currentTarget.hanzi[currentTarget.type];

	const randomIndex = Math.random() > 0.5 ? 1 : 0;

	let indexes;
	[indexes, fieldset1CorrectIndex] = createTargetOptions(inputTypes[randomIndex], 'loopFieldset1');
	[, fieldset2CorrectIndex] = createTargetOptions(inputTypes[1 - randomIndex], 'loopFieldset2', indexes);

	updateLoopStatus();
}

/**
 * @param {IHanziKey} type
 * @param {string} fieldsetId
 * @param {number[]|undefined} optionIndexes
 * @returns {[number[],string]} indexes of created options to be used for second input and correct answer index
 */
function createTargetOptions(type, fieldsetId, optionIndexes) {
	const options = [];
	if (optionIndexes) {
		for (const index of optionIndexes) {
			const option = data.hanzi[index][type];
			Math.random() < 0.5 ? options.push(option) : options.unshift(option);
		}
	} else {
		optionIndexes = [];
		while (options.length < GUESS_OPTIONS_NUMBER - 1) {
			const optionIndex = Math.floor(Math.random() * data.hanzi.length);
			const { [type]: option } = data.hanzi[optionIndex];
			if (currentTarget.hanzi[type] !== option && !options.includes(option)) {
				options.push(option);
				optionIndexes.push(optionIndex);
			}
		}
	}
	const correctIndex = Math.floor(Math.random() * GUESS_OPTIONS_NUMBER);
	options.splice(correctIndex, 0, currentTarget.hanzi[type]);

	const fieldset1 = document.getElementById(fieldsetId);
	fieldset1.querySelector('legend').textContent = targetTypeLabel(type);
	while (fieldset1.children.length > 1) {
		fieldset1.lastChild.remove();
	}

	for (let i = 0; i < options.length; i++) {
		const option = options[i];
		const id = `${fieldsetId}-option${i}`;
		const label = Object.assign(document.createElement('label'), { for: id });
		const input = Object.assign(document.createElement('input'), { id, type: 'radio', name: type, value: i });
		label.appendChild(input);
		label.append(option);
		fieldset1.appendChild(label);
	}

	return [optionIndexes, correctIndex];
}

function checkTarget() {
	const fieldset1 = document.getElementById('loopFieldset1');
	const fieldset2 = document.getElementById('loopFieldset2');
	checkFieldset(fieldset1, fieldset1CorrectIndex);
	checkFieldset(fieldset2, fieldset2CorrectIndex);
}

/**
	* @param {HTMLElement} element
	* @param {number} correctIndex
	*/
function checkFieldset(element, correctIndex) {
	const value = element.querySelector('input:checked')?.value;
	if (value) {
		const isCorrect = correctIndex.toString() === value;
		if (isCorrect) {
			element.classList.toggle('correct', true);
			element.classList.toggle('incorrect', false);
		} else {
			element.classList.toggle('incorrect', true);
			element.classList.toggle('correct', false);
		}
	} else {
		element.classList.remove('correct', 'incorrect');
	}
}

function resetFieldsets() {
	document.getElementById('loopFieldset1').classList.remove('correct', 'incorrect');
	document.getElementById('loopFieldset2').classList.remove('correct', 'incorrect');
}

function hideTargetNote() {
	const element = document.getElementById('targetNote');
	element.firstElementChild.style.display = '';
	while (element.lastChild !== element.firstElementChild) {
		element.lastChild.remove();
	}
}

function revealTargetNote() {
	const element = document.getElementById('targetNote');
	element.firstElementChild.style.display = 'none';
	element.append(currentTarget.hanzi.note || '-');
}

/** @type {SVGSVGElement} */
const canvas = document.getElementById('canvas');
let canvasX, canvasY;

function onResize() {
	({ left: canvasX, top: canvasY } = canvas.getBoundingClientRect());
}
window.addEventListener('resize', onResize);

function clearCanvas() {
	canvas.innerHTML = '';
}

const color = window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'white' : 'black';
/** @type {SVGPathElement|undefined} */
let currentPath;
/** @type {[number,number][]} */
let points = [];

/** @param {Event} event */
function getXY(event) {
	let x, y;
	if (event.type.startsWith('mouse')) {
		x = event.offsetX;
		y = event.offsetY;
	} else if (event.type.startsWith('touch')) {
		const touch = event.touches[0];
		x = touch.clientX - canvasX;
		y = touch.clientY - canvasY;
		event.preventDefault();
	}
	return [x, y];
}

/** @param {[number, number]} p */
function startDrawing(p) {
	points = [p];

	currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	currentPath.setAttribute('d', createDAttr());
	currentPath.setAttribute('stroke', color);
	currentPath.setAttribute('stroke-width', 3);
	currentPath.setAttribute('fill', 'none');
	currentPath.setAttribute('stroke-linecap', 'round');
	currentPath.setAttribute('stroke-linejoin', 'round');

	canvas.appendChild(currentPath);
}

/** @param {[number, number]} newPoints */
function draw(newPoints) {
	points.push(newPoints);
	currentPath.setAttribute('d', createDAttr());
}

function stopDrawing() {
	currentPath = undefined;
	points = [];
}

function createDAttr() {
	if (!points.length) {
		return '';
	}
	const d = ['M', points[0][0].toFixed(2), points[0][1].toFixed(2)];
	for (const [x, y] of points) {
		d.push('L', x.toFixed(2), y.toFixed(2));
	}
	return d.join(' ');
}

/** @param {Event} e */
function onCanvasMove(e) {
	draw(getXY(e));
}

canvas.addEventListener('mousedown', (e) => {
	if (e.buttons === 1) {
		canvas.addEventListener('mousemove', onCanvasMove);
		startDrawing(getXY(e));
	}
});

canvas.addEventListener('mouseup', () => {
	canvas.removeEventListener('mousemove', onCanvasMove);
	stopDrawing();
});

canvas.addEventListener('mouseleave', () => {
	canvas.removeEventListener('mousemove', onCanvasMove);
	stopDrawing();
});

canvas.addEventListener('touchstart', (e) => {
	canvas.addEventListener('touchmove', onCanvasMove);
	startDrawing(getXY(e));
});

canvas.addEventListener('touchend', () => {
	canvas.removeEventListener('touchmove', onCanvasMove);
	stopDrawing();
});

canvas.addEventListener('touchcancel', () => {
	canvas.removeEventListener('touchmove', onCanvasMove);
	stopDrawing();
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'z' && event.ctrlKey && document.activeElement?.nodeName?.toLowerCase() === 'body') {
		canvas.lastElementChild?.remove();
	}
});
