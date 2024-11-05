function resize() {
	var coef = (innerWidth >= innerHeight * (16 / 9) ? (innerHeight / 720) : (innerWidth / 1280));
	document.getElementsByTagName("body")[0].style.transform = "scale(" + coef + ")";
}

setInterval(resize, 100);

class Question {
	id = 0;
	enonce = "";
	answers = [1, 0, 0, -1]; // 1 = bonne réponse, 0 = mauvaise réponse, -1 = réponse masquée
	answersText = ["Oui", "Non", "Peut-être", "Je ne sais pas"]; // qui à la ref ??

	constructor(id, enonce, answers) {
		this.id = id;
		this.enonce = enonce;
		this.answers = answers;
	}
}

class Jeu {
	totalQuestions = 40;
	tempsReponses = 1500; // en 1/100 secondes
	questions = new Array();
	questionActuelle = 1;
	joueurs = 1;
	joueurActuel = 1;
	tempsActuel = 1500;

	ChoixQuestions() {
		const reserve = [...allQuestions];

		for (let index = 0; index < this.totalQuestions; index++) {
			let rdm = Math.floor(Math.random() * reserve.length);

			this.questions.push(reserve[rdm]);
			reserve.splice(rdm, 1);

			if (reserve.length == 0)
				break;
		}
	}

	Valider() {
		this.ProchainJoueur();
	}

	ProchaineQuestion() {
		this.joueurActuel = 1;
		this.AfficherQuestion(++this.questionActuelle);
	}

	ProchainJoueur() {
		this.joueurActuel++;
		this.tempsActuel = this.tempsReponses;

		if (this.joueurActuel > this.joueurs)
			this.ProchaineQuestion();
	}

	AfficherQuestion(numQuestion) {
		if (numQuestion > this.totalQuestions)
			FinJeu();
		else {
			document.getElementById("Numero").innerHTML = NumberFormat(numQuestion);
			numQuestion--;

			document.getElementById("Enonce").innerHTML = this.questions[numQuestion].enonce;
			console.log(this.questions[numQuestion]);

			document.getElementsByTagName("img")[0].src = "./assets/" + NumberFormat(this.questions[numQuestion].id) + ".jpg";

			document.getElementById("A").innerHTML = this.questions[numQuestion].answersText[0];
			document.getElementById("B").innerHTML = this.questions[numQuestion].answersText[1];

			if (this.questions[numQuestion].answers[2] > -1) {
				document.getElementById("C").innerHTML = this.questions[numQuestion].answersText[2];
				document.getElementById("PropC").classList.remove("hidden");
			}
			else {
				document.getElementById("PropC").classList.add("hidden");
			}

			if (this.questions[numQuestion].answers[3] > -1) {
				document.getElementById("D").innerHTML = this.questions[numQuestion].answersText[3];
				document.getElementById("PropD").classList.remove("hidden");
			}
			else {
				document.getElementById("PropD").classList.add("hidden");
			}
		}
	}
}

class Joueur {
	nom = "toto";
	score = 0;
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

const allQuestions = new Array();

allQuestions.push(new Question(1, "Je dépasse le camion ?", [0, 1, -1, -1]));
allQuestions.push(new Question(2, "Je dépasse le vélo ?", [1, 0, -1, -1]));
allQuestions.push(new Question(3, "Je dépasse la tesla ?", [0, 0, 1, -1]));
allQuestions.push(new Question(4, "Je dépasse mes limites ?", [0, 1, -1, -1]));
allQuestions.push(new Question(5, "Je dépasse le maître ?", [0, 1, 1, -1]));
allQuestions.push(new Question(6, "Je dépasse la vitesse du son ?", [0, 1, -1, -1]));

let jeu = new Jeu();
jeu.ChoixQuestions();

jeu.AfficherQuestion(1);