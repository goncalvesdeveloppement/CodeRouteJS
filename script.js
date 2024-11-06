let staticWidth = 900, staticHeight = 720;
let tempsActuel = 0;
let jeu = undefined;

function resize() {
	var coef = (innerWidth >= innerHeight * (16 / 9) ? (innerHeight / staticHeight) : (innerWidth / staticWidth));
	document.getElementsByTagName("body")[0].style.transform = "scale(" + coef + ")";
}

setInterval(resize, 100);

class Question {
	id = 0;
	enonce = "";
	points = 1;
	defaultAnswers = [1, 0, 0, 0]; // 1 = bonne réponse, 0 = mauvaise réponse, -1 = réponse masquée
	answersText = ["", "", "", ""]; 

	constructor(enonce, answers, answersText) {
		this.id = idQuestion++;
		this.enonce = enonce;
		this.defaultAnswers = answers;
		this.answersText = answersText;
		this.points = 1; // changer plus tard
	}

	IsCorrect(answers) {
		let result = true;

		console.log("user : " + answers + "\ncorrect : " + this.defaultAnswers);
		

		for (let index = 0; index < 4; index++) {
			console.log(`Réponse utilisateur à l'indice ${index} : ${answers[index]}, Réponse correcte : ${this.defaultAnswers[index]}`);

			if (answers[index] != this.defaultAnswers[index] && this.defaultAnswers[index] > -1) {
				result = false;
				console.log("Réponse incorrecte détectée à l'indice " + index);
				break;
			}
		}
		return result;
	}
}

class Jeu {
	totalQuestions = 40;
	tempsReponses = 1500; // en 1/100 secondes
	questions = new Array();
	numQuestionActuelle = 0;
	joueurs = new Array();
	joueurActuel = 1;
	interval;

	// Récupère le multiplicateur de points selon le temps écoulé (en 1/100 s)
	GetPointsFromTime(timeElapsed, answers) {
		let coef = (Math.exp(-(0.003) * timeElapsed) * 100) + 5;
		let points = this.questions[this.numQuestionActuelle].points;

		return Math.round((this.questions[this.numQuestionActuelle - 1].IsCorrect(answers) ? points * coef : 0));
	}

	ChoixQuestions(id) {
		const reserve = [...questionsDb[id]];

		for (let index = 0; index < this.totalQuestions; index++) {
			let rdm = Math.floor(Math.random() * reserve.length);

			this.questions.push(reserve[rdm]);
			reserve.splice(rdm, 1);

			if (reserve.length == 0)
				break;
		}
	}

	Valider() {
		clearInterval(this.interval);

		// récup des réponses
		let answers = new Array(4);

		answers[0] = document.getElementById("CheckA").checked ? 1 : 0;
		answers[1] = document.getElementById("CheckB").checked ? 1 : 0;
		answers[2] = document.getElementById("CheckC").checked ? 1 : 0;
		answers[3] = document.getElementById("CheckD").checked ? 1 : 0;

		let numQuestionTmp = this.numQuestionActuelle - 1;
		console.log("this.numQuestionActuelle = " + numQuestionTmp);
		

		if (this.questions[numQuestionTmp].defaultAnswers[3] <= -1)
			answers[3] = this.questions[numQuestionTmp].defaultAnswers[3];
		
		if (this.questions[numQuestionTmp].defaultAnswers[2] <= -1)
			answers[2] = this.questions[numQuestionTmp].defaultAnswers[2];
		
		alert("tes réponses : " + answers);
		alert("bonnes réps : " + this.questions[numQuestionTmp].defaultAnswers);
		
		let time = this.tempsReponses - tempsActuel;

		let pointsBonus = this.GetPointsFromTime(time, answers);

		this.joueurs[this.joueurActuel - 1].points += pointsBonus;

		if (pointsBonus > 0)
			console.log("bravo vous gagnez " + this.GetPointsFromTime(time, answers) + " points.");
		else
			console.log("oups mauvaise réponse");

		this.ProchainJoueur();
	}

	ProchaineQuestion() {
		this.joueurActuel = 1;
		this.AfficherQuestion(++this.numQuestionActuelle);
	}

	CheckRemainingTime() {
		if (tempsActuel > 0)
			tempsActuel--;

		document.getElementById("Temps").innerHTML = "00:" + NumberFormat(Math.ceil(tempsActuel / 100));

		if (tempsActuel == 0) {
			document.getElementsByTagName("audio")[1].currentTime = 0;
			document.getElementsByTagName("audio")[1].play();
			document.getElementsByTagName("audio")[0].pause();
			alert("TIME's UP !!!!!!");

			tempsActuel = this.tempsReponses;
			this.ProchainJoueur();
		}
	}

	ProchainJoueur() {
		document.getElementById("CheckA").checked = false;
		document.getElementById("CheckB").checked = false;
		document.getElementById("CheckC").checked = false;
		document.getElementById("CheckD").checked = false;

		document.getElementsByTagName("audio")[0].currentTime = 0;
		document.getElementsByTagName("audio")[0].play();

		this.joueurActuel++;
		tempsActuel = this.tempsReponses;

		this.interval = setInterval(() => this.CheckRemainingTime(), 10);

		if (this.joueurActuel > this.joueurs.length) {
			this.ProchaineQuestion();
		}
	}

	AfficherQuestion(numQuestion) {
		this.numQuestionActuelle = numQuestion;
		alert("la question " + numQuestion);

		if (numQuestion > this.totalQuestions)
			FinJeu();
		else {
			document.getElementById("Numero").innerHTML = NumberFormat(numQuestion);
			numQuestion--;

			document.getElementById("Enonce").innerHTML = this.questions[numQuestion].enonce;

			document.getElementsByTagName("img")[0].src = "./assets/" + NumberFormat(this.questions[numQuestion].id) + ".jpg";

			document.getElementById("A").innerHTML = this.questions[numQuestion].answersText[0];
			document.getElementById("B").innerHTML = this.questions[numQuestion].answersText[1];

			if (this.questions[numQuestion].defaultAnswers[2] > -1) {
				document.getElementById("C").innerHTML = this.questions[numQuestion].answersText[2];
				document.getElementById("PropC").classList.remove("hidden");
			}
			else {
				document.getElementById("PropC").classList.add("hidden");
			}

			if (this.questions[numQuestion].defaultAnswers[3] > -1) {
				document.getElementById("D").innerHTML = this.questions[numQuestion].answersText[3];
				document.getElementById("PropD").classList.remove("hidden");
			}
			else {
				document.getElementById("PropD").classList.add("hidden");
			}

			alert(this.questions[numQuestion].defaultAnswers);
		}
	}
}

class Joueur {
	nom = "toto";
	points = 0;

	constructor(nom) {
		this.nom = nom;
		this.points = 0;
	}
}

function NumberFormat(number, digits = 2) {
	if ((number + "").length < digits) {
		let missingDigits = digits - (number + "").length;
		let zeros = "";

		for (let index = 0; index < missingDigits; index++) {
			zeros += "0";
		}

		return zeros + number;
	}

	return number + "";
}

let idQuestion = 1;
const questionsDb = new Array();
const questionsF = new Array();
const questionsM = new Array();
const questionH = new Array();

questionsF.push(new Question("Je dépasse le camion ?", [1, 0, 0, -1], ["","","",""]));
questionsF.push(new Question("Je dépasse le vélo ?", [1, 0, 1, 1], ["","","",""]));
questionsF.push(new Question("Je dépasse la tesla ?", [1, 0, 0, -1], ["","","",""]));
questionsF.push(new Question("Je dépasse mes limites ?", [1, 0, 0, -1], ["","","",""]));
questionsF.push(new Question("Je dépasse le maître ?", [1, 0, -6, -1], ["","","",""]));
questionsF.push(new Question("Je dépasse la vitesse du son ?", [0, 1, -7, -1], ["","","",""]));

questionsDb.push(questionsF);

function Start() {
	jeu = new Jeu();
	jeu.ChoixQuestions(0);

	document.getElementById("QuestionContainer").classList.remove("hidden");
	document.getElementById("ReponseContainer").classList.remove("hidden");
	document.getElementById("ValContainer").classList.remove("hidden");
	document.getElementById("StartMenu").classList.add("hidden");

	jeu.joueurs.push(new Joueur("nath"));

	jeu.joueurActuel = 99;
	jeu.ProchainJoueur();
}