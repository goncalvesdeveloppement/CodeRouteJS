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

		for (let index = 0; index < 4; index++) {
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
	numQuestionActuelle = 1;
	joueurs = new Array();
	joueurActuel = 1;
	interval;
	mode = 0;

	// Récupère le multiplicateur de points selon le temps écoulé (en 1/100 s)
	GetPointsFromTime(timeElapsed, answers) {
		let coef = (Math.exp(-(0.003) * timeElapsed) * 100) + 5;
		let points = this.questions[this.numQuestionActuelle - 1].points;

		return Math.round((this.questions[this.numQuestionActuelle - 1].IsCorrect(answers) ? points * coef : 0));
	}

	ChoixQuestions() {
		const reserve = [...questionsDb[this.mode]];

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

		if (this.questions[numQuestionTmp].defaultAnswers[3] <= -1)
			answers[3] = this.questions[numQuestionTmp].defaultAnswers[3];

		if (this.questions[numQuestionTmp].defaultAnswers[2] <= -1)
			answers[2] = this.questions[numQuestionTmp].defaultAnswers[2];

		let time = this.tempsReponses - tempsActuel;

		let pointsBonus = this.GetPointsFromTime(time, answers);

		this.joueurs[this.joueurActuel - 1].points += pointsBonus;
		this.ProchainJoueur();
	}

	ProchaineQuestion() {
		if (this.numQuestionActuelle >= this.questions.length) {
			this.joueurs.sort(compare);
			clearInterval(this.interval);
			this.interval = null;
			
			document.getElementsByTagName("audio")[0].pause();
			document.getElementsByTagName("audio")[1].pause();

			document.getElementsByTagName("audio")[2].play();

			let str = "";

			if (this.joueurs.length > 1) {
				for (let i = 0; i < this.joueurs.length; i++)
					str += "#" + (i + 1) + " : " + this.joueurs[i].nom + " — " + this.joueurs[i].points + "<br>";
			}
			else {
				str = this.joueurs[0].nom + ", vous avez obtenu " + jeu.joueurs[0].points + " points. Bravo.";
			}

			document.getElementById("QuestionContainer").classList.add("hidden");
			document.getElementById("ReponseContainer").classList.add("hidden");
			document.getElementById("ValContainer").classList.add("hidden");
			document.getElementById("End").classList.remove("hidden");

			document.getElementById("ClassementFinal").innerHTML = str;
		}
		else {
			this.joueurActuel = 1;
			this.numQuestionActuelle++;
		}
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
		this.joueurActuel++;

		tempsActuel = this.tempsReponses;

		this.interval = setInterval(() => this.CheckRemainingTime(), 10);

		if (this.joueurActuel > this.joueurs.length) {
			this.ProchaineQuestion();
		}

		if (jeu.joueurs.length > 1)
			alert("à toi, " + this.joueurs[this.joueurActuel - 1].nom + " !");

		document.getElementsByTagName("audio")[0].currentTime = 0;
		document.getElementsByTagName("audio")[0].play();

		this.AfficherQuestion(this.numQuestionActuelle);
	}

	AfficherQuestion(numQuestion) {
		this.numQuestionActuelle = numQuestion;

		if (numQuestion > this.totalQuestions)
			FinJeu();
		else {
			document.getElementById("Numero").innerHTML = NumberFormat(numQuestion);
			numQuestion--;

			document.getElementById("Enonce").innerHTML = this.questions[numQuestion].enonce;

			document.getElementsByTagName("img")[0].src = "./assets/" + this.mode + "/" + this.questions[numQuestion].id + ".jpg";

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
		}
	}
}

class Joueur {
	nom = "anonyme";
	points = 0;

	constructor(nom) {
		if (nom != "")
			this.nom = nom;

		this.points = 0;
	}
}

function compare(a, b) {
	if (a.points < b.points) {
		return 1;
	}
	if (a.points > b.points) {
		return -1;
	}
	return 0;
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
const questionsH = new Array();

questionsF.push(new Question("Je vois un panneau stop je m'arrête ?", [1, 0, -1, -1], ["Oui", "Non", "", ""]));
questionsF.push(new Question("Comment appelle-t-on un poisson qui sort de l'eau et traverse la route?", [1, 0, 0, -1], ["Un piéton", "Un poisson volant", "Un pied de thon", ""]));
questionsF.push(new Question("Pourquoi les feux de circulation ne jouent-ils jamais à cache-cache ?", [1, 0, -1, -1], ["Parce qu'ils ont peur de se faire griller !", "Parce que les poulets traversent la route", "", ""]));
questionsF.push(new Question("Si après avoir bu, vous conduisez en zigzagant, continuez-vous de conduire?", [1, 0, -1, -1], ["Non", "Oui", "", ""]));
questionsF.push(new Question("Je cède le passage :", [0, 1, -1, -1], ["A gauche", "A droite", "", ""]));
questionsF.push(new Question("Un bébé peut-il voyager dans les bras d'un adulte et jouer avec le volant?", [0, 1, -1, -1], ["Oui", "Non", "", ""]));
questionsF.push(new Question("Je roule à 90 km/h, pour m'arrêter il faudra :", [0, 1, 0, -1], ["une peau de banane", "Une pédale de frein", "faire une cascade", ""]));
questionsF.push(new Question("Je conduis depuis 3 heures, je suis fatigué :", [0, 1, 0, -1], ["J'accélère pour arriver plus vite", "Je m'arrête pour faire une sieste", "Je continue mon parcours", ""]));
questionsF.push(new Question("Je peux dépasser :", [1, 0, -1, -1], ["Oui", "Non", "", ""]));
questionsF.push(new Question("Je passe sous un tunnel :", [0, 1, 0, -1], ["J'appelle un ami", "J'allume les phares", "Je pile devant un camion", ""]));
questionsF.push(new Question("Quand il neige:", [1, 0, -1, -1], ["J'allume les phares", "Je roule sans phares", "", ""]));
questionsF.push(new Question("J'ai la possibilité de dépasser un cycliste:", [0, 1, 0, -1], ["Je lui balance une peau de banane", "Je mets le clignotant et le dépasse", "Je le pousse pour qu'il aille plus vite", ""]));
questionsF.push(new Question("Lors d'un contrôle de police, je dois présenter :", [0, 1, -1, -1], ["ma bouteille d'alcool", "mon permis de conduire", "", ""]));
questionsF.push(new Question("Ai-je le droit de stationner en plein milieu de la circulation?", [0, 1, -1, -1], ["Oui", "Non", "", ""]));
questionsF.push(new Question("Avec le permis B, je peux:", [1, 0, -1, -1], ["conduire une mario Kart", "voler un vélo", "", ""]));
questionsF.push(new Question("Le siège conducteur est réglable :", [0, 1, -1, -1], ["en douceur", "en hauteur", "", ""]));
questionsF.push(new Question("Il est conseiller de mettre ses essuies-glaces :", [0, 1, -1, -1], ["Quand il fait soleil", "Quand il pleut", "", ""]));
questionsF.push(new Question("Quand dois-je mettre la ceinture de sécurité:", [1, 0, 0, -1], ["Quand je suis en voiture", "Quand je dors", "Quand je me promène à pied", ""]));
questionsF.push(new Question("Après le panneau 50 km/h, je peux:", [1, 0, 0, -1], ["rouler à 50", "arrêter la voiture", "rouler à 110", ""]));
questionsF.push(new Question("Que devez-vous faire lorsque vous voyez le feu passer au rouge ?", [0, 1, -1, -1], ["Accélérer", "S'arrêter", "", ""]));
questionsF.push(new Question("Quel est le meilleur moment pour utiliser vos clignotants ?", [1, 0, -1, -1], ["Avant de tourner", "Après avoir tourné", "", ""]));
questionsF.push(new Question("Si vous entendez une sirène de police, que devez-vous faire ?", [0, 1, -1, -1], ["Ignorer", "Se ranger sur le côté", "", ""]));
questionsF.push(new Question("Quand devez-vous céder le passage ?", [0, 1, -1, -1], ["Toujours", "Seulement quand il y a d'autres voitures", "", ""]));
questionsF.push(new Question("Quel est l'effet de la vitesse sur votre temps de réaction ?", [0, 1, -1, -1], ["Cela l'améliore", "Cela le ralentit", "", ""]));
questionsF.push(new Question("Que devez-vous faire si un piéton traverse la route ?", [0, 1, -1, -1], ["Klaxonner", "S'arrêter pour le laisser passer", "", ""]));
questionsF.push(new Question("Si vous êtes fatigué en conduisant, que devez-vous faire ?", [0, 1, -1, -1], ["Ouvrir la fenêtre", "Trouver un endroit pour vous reposer", "", ""]));
questionsF.push(new Question("Que signifie un panneau de limitation de vitesse ?", [0, 1, -1, -1], ["Une suggestion", "Une obligation", "", ""]));
questionsF.push(new Question("Que devez-vous faire si vous êtes impliqué dans un accident ?", [0, 1, -1, -1], ["Fuir", "Échanger des informations avec l'autre conducteur", "", ""]));
questionsF.push(new Question("Quel est le rôle des rétroviseurs ?", [0, 1, -1, -1], ["Décorer la voiture", "Aider à voir derrière vous", "", ""]));
questionsF.push(new Question("Que devez-vous faire avant de changer de voie ?", [1, 0, -1, -1], ["Regarder dans votre rétroviseur", "Ne rien faire", "", ""]));

idQuestion = 1;

questionsM.push(new Question("Je vais à Arzens. Je suivrai la départementale N°33 :", [1, 0, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("Ce panneau électronique me signale que :", [1, 0, 0, 1], ["Je me trouve en excès de vitesse", "Je vais recevoir une amende", "Je passe devant une école", "Je dois ralentir"]));
questionsM.push(new Question("Quels sont les risques lorsque je roule dans une telle forêt ? :", [1, 1, 1, 0], ["Percuter un animal sauvage", "Me perdre dans mon itinéraire", "Un croisement diffcile", "Devoir allumer les feux de route"]));
questionsM.push(new Question("La conduite sous l'emprise de médicaments de manière encadrée est moins risquée que la conduite sous alcool : ", [0, 1, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("Dans un rond point, je prends la deuxième sortie :", [0, 0, 1, 0], ["Je mets mon clignotant droit", "Je me place forcément sur la file de gauche", "Je cède le passage aux automobilistes arrivant à gauche", "Je pourrai dépasser les automobilistes de la file de gauche"]));
questionsM.push(new Question("Je dois nécessairement m'arrêter :", [0, 1, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("J'utilise les clignotants :", [1, 1, 1, 1], ["À une intersection", "En sortant d'un rond point", "Pour m'arrêter sur le bas-côté", "Lorsque je change de file sur l'autoroute"]));
questionsM.push(new Question("Ce véhicule stationné risque :", [1, 0, 1, 1], ["Une amende", "Un retrait de points", "Un ramassage par la fourrière", "De gêner d'autres automobilistes"]));
questionsM.push(new Question("J'achète une voiture, ma plaque d'immatriculation :", [0, 0, 1, 0], ["Peut être jaune à l'arrière", "Doit systématiquement être renouvelée", "Peut être associée au département de mon choix", "Peut contenir n'importe quelle lettre de l'alphabet"]));
questionsM.push(new Question("Cette plaque signifie :", [0, 0, 1, -1], ["Que le véhicule est fabriqué en France", "Que le propriétaire habite dans le 71", "Que le véhicule est répertorié au niveau national", ""]));
questionsM.push(new Question("Je passe au feu orange. Je risque une perte de points :", [0, 1, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("Pour éviter un accident sur un coup de fatigue, je peux :", [1, 1, 1, 1], ["Emprunter des itinéraires plus rapides", "M'arrêter régulièrement", "Respecter les limitations de vitesse", "Etre prudent (c'est vraiment ma voiture sur la photo donc ça n'arrive pas qu'aux autres !🙏🏻)"]));
questionsM.push(new Question("Un panneau carré indique une obligation : ", [0, 1, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("Dans cette situation :", [1, 1, 1, -1], ["Je quitte l'agglomération de Pradelles", "Je suis sur un axe prioritaire", "Je suis sur la route nationale N°88", ""]));
questionsM.push(new Question("Ce panneau m'indique que je dois rouler à 50 km/h ou moins :", [1, 0, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("Quel panneau me signale un stationnement à durée limitée ?", [0, 1, 0, -1], ["Le panneau de gauche", "Le panneau central", "Le panneau de droite", ""]));
questionsM.push(new Question("Je peux conduire un scooter 125 avec mon permis B en ayant passé une formation supplémentaire :", [1, 0, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("Les apps de signalements de radar sont illégales. Il existe une exeption autorisant d'utiliser le téléphone au volant pour signaler un danger sur Waze.", [0, 0, 0, 1], ["Vrai et vrai", "Vrai et faux", "Faux et vrai", "Faux et faux"]));
questionsM.push(new Question("Pour regonfler les pneus de cette incroyable citadine rouge, je dois me référer aux indicateurs présents dans l'encadrement de portière conducteur :", [1, 0, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("Ma voiture neuve est équipée de détecteurs assistant ma conduite, notamment lors des débordements de voie :", [0, 1, 1, -1], ["Je lui fais confiance, le but est que je me sente passager", "Ce sont des aides à la conduite mais en aucun cas des substitutions", "Je ne devrais pas m'y habituer car toutes les voitures n'en bénéficient pas", ""]));
questionsM.push(new Question("J'entre sur une autoroute de manière imminente :", [0, 0, 1, -1], ["Je vérifie l'angle mort gauche, j'accélère puis je mets le clignotant gauche", "J'accélère, je mets mon clignotant gauche puis je regarde l'angle mort gauche", "Je mets mon clignotant gauche, je regarde mon clignotant gauche puis j'accélère en étant vigilant", ""]));
questionsM.push(new Question("Le contrôle technique est valable 2 ans pour toutes les voitures :", [0, 1, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("Je n'ai plus envie d'aller à Tarbes. Je reste sur l'A64 :", [1, 0, -1, -1], ["Oui", "Non", "", ""]));
questionsM.push(new Question("Ce panneau indique :", [0, 1, 0, -1], ["L'entrée dans un lieu-dit dont le logo est un N stylisé", "Une succession de virages dangereux dont le premier est forcément à droite", "Une obligation de ralentir", ""]));
questionsM.push(new Question("Afin de jouir librement de mon permis de conduire, je m'assure de :", [1, 1, 1, 0], ["Avoir obtenu un minimum de 20 points à l'examen sans erreur éliminatoire", "Avoir fêté mon dix-huitième anniversaire révolu", "Avoir un véhicule en ma possession légale ou assuré pour que je puisse le conduire", "Apposer le disque A sur le capot de mon véhicule"]));
questionsM.push(new Question("Certains radars automatiques peuvent :", [1, 0, 1, -1], ["Enregistrer les contraventions liées au non-port de la ceinture", "Enregistrer les nuisances sonores pour musique trop forte", "Capter un excès de vitesse de moins de 10 km/h", ""]));
questionsM.push(new Question("Quel indicateur dois-je vérifier lorsque je me trouve en position 3 ?", [0, 0, 1, -1], ["Le niveau d'huile moteur", "Le niveau de liquide de direction assistée", "Le niveau de liquide de freinage", ""]));
questionsM.push(new Question("Un voyant de couleur orange peur signifier :", [1, 1, 0, 1], ["Un avertissement sur un potentiel danger imminent", "Un éclairage pouvant gêner d'autres automobilistes", "La nécessité de m'arrêter immédiatement", "Un réservoir de carburant presque vide"]));
questionsM.push(new Question("Le bonhomme est devenu rouge, mais je n'ai pas fini de traverser :", [0, 0, 1, -1], ["Je m'arrête en attendant qu'il redevienne vert", "Je cours à toute vitesse avant de me faire écraser", "Je termine de traverser en accélérant un peu le pas, mais en restant prudent", ""]));
questionsM.push(new Question("Ce nouveau panneau a été mis en vigueur depuis 2024. Il indique :", [1, 0, 0, 0], ["Une zone dans laquelle je dois prendre des mesures particulières de conduite écologique", "Une zone très fréquentée par les Renault", "Une zone interdite aux Renault", "Une zone réservée aux Renault"]));

idQuestion = 1;

// questionsD.push...

questionsDb.push(questionsF);
questionsDb.push(questionsM);

function Start(mode) {
	jeu = new Jeu();
	jeu.mode = mode;
	jeu.totalQuestions = document.getElementById("GameLength").value;
	jeu.ChoixQuestions();

	jeu.joueurs.push(new Joueur(document.getElementById("NomJ1").value));

	if (document.getElementById("J2").checked) {
		jeu.joueurs.push(new Joueur(document.getElementById("NomJ2").value));


		if (document.getElementById("J3").checked) {
			jeu.joueurs.push(new Joueur(document.getElementById("NomJ3").value));



			if (document.getElementById("J4").checked) {
				jeu.joueurs.push(new Joueur(document.getElementById("NomJ4").value));
			}
		}
	}

	document.getElementById("QuestionContainer").classList.remove("hidden");
	document.getElementById("ReponseContainer").classList.remove("hidden");
	document.getElementById("ValContainer").classList.remove("hidden");
	document.getElementById("StartMenu").classList.add("hidden");


	jeu.joueurActuel = 0;
	jeu.ProchainJoueur();
}