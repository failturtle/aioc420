var last_gamedata_version = -1;
var player_id = -1;
var trump_suit;

function makeCardText(cardname) {
	var result = cardname;
	var is_trump = false;
	if (cardname == 'Joker') is_trump = true;
	if (cardname.indexOf(trump_suit) != -1) is_trump = true;
	if (trump_suit == 'Hearts' && cardname == 'Jack of Diamonds') is_trump = true; 
	if (trump_suit == 'Diamonds' && cardname == 'Jack of Hearts') is_trump = true; 
	if (trump_suit == 'Spades' && cardname == 'Jack of Clubs') is_trump = true; 
	if (trump_suit == 'Clubs' && cardname == 'Jack of Spades') is_trump = true; 
	if (is_trump) {
		result = '<td><span class="blue">' + cardname + '</span></td>';
	} else if (cardname.indexOf('Diamonds') != -1 || cardname.indexOf('Hearts') != -1) {
		result = '<td><span class="red">' + cardname + '</span></td>';
	} else {
		result = '<td><span>' + cardname + '</span></td>';
	}
	return result;
}

function makeTableTable(cards) {
	var played_html = '<table>';
	for (i in cards) {
		var pid = cards[i].player;
		var card = cards[i].card;
		var cardname = card;
		if (cards[i].state == 'discarded') cardname = '(discarded)';
		played_html += '<tr>';
		played_html += '<td>Player ' + (pid + 1) + ': ' + makeCardText(cardname) + '</td>';
		if (pid == player_id) {
			played_html += '<td><button onclick="cardPickup(\'' + card + '\');">Pickup</button></td>';
		} else {
			played_html += '<td></td>';
		}
		played_html += '</tr>';
	}
	played_html += '</table>';
	return played_html;
}

// Update the game view with the given data.
function updateGameView(data, status) {
	if (player_id != -1 && data.version_id != last_gamedata_version) {
		trump_suit = data.trump;
		var myhand = data.hands[player_id];
		var table = data.table;
		table.reverse();
		// console.log(data.kitty, data.kitty.length);
		$('#kittyCards').text(data.kitty.length + ' cards');
		hand_html = '<table>';
		for (i in myhand) {
			hand_html += '<tr>';
			hand_html += '<td>' + makeCardText(myhand[i]) + '</td>';
			var button_label = 'Play';
			if (myhand.length > 10) {
				button_label = 'Discard';
			}
			hand_html += '<td><button onclick="cardPlay(\'' + myhand[i] + '\');">' + button_label + '</button></td>';
			hand_html += '</tr>';
			// console.log(myhand[i], t);
		}
		hand_html += '</table>';
		// console.log(hand_html);
		$("#myCards").html(hand_html);
		$("#playedCards").html(makeTableTable(data.table));
		$("#floorCards").html(makeTableTable(data.floor));
		$("#trumpSuit").text("The trump suit is " + data['trump']);
		last_gamedata_version = data.version_id
	}
}

// Update the game view and set a timer to check for new data.
function updateGameViewSetTimer(data, status) {
	updateGameView(data, status);
	setTimeout(getGameData, 300);
}

function changePlayer(pid) {
	player_id = pid;
	last_gamedata_version = -1;
	$("#yourName").text("You are player " + (pid + 1));
}

function cardPlay(card) {
	// console.log('Playing card: ', card)
	$.post("/action",
		{
			'action': 'play',
			'card': card,
			'player': player_id
		},
		updateGameView
	);
}

function cardDisc(card) {
	// console.log('Playing card: ', card)
	$.post("/action",
		{
			'action': 'discard',
			'card': card,
			'player': player_id
		},
		updateGameView
	);
}

function cardPickup(card) {
	$.post("/action",
		{
			'action': 'pickup',
			'card': card,
			'player': player_id
		},
		updateGameView
	);
}

function uniAction(action_name) {
	if (action_name == 'redeal') {
		trump_suit = 'No trump';
	}
	$.post('/action',
		{
			'action': action_name,
			'player': player_id
		},
		updateGameView
	);
}

function setTrump(suit) {
	trump_suit = suit;
	$.post('/action',
		{
			'action': 'setTrump',
			'player': player_id,
			'suit': suit
		},
		updateGameView
	);
}

function getGameData() {
	$.get("/gamestate",
		updateGameViewSetTimer
	);
}

setTimeout(getGameData, 1000);
