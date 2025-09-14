<?php
session_start();
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin']) {
  ?>
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sakkadentraining</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
  </head>

  <body>
    <div class="container">
      <?php include 'main_content.html'; ?>
    </div>
    <script type="module" src="main.js"></script>
  </body>

  </html>
  <?php
} else {
  ?>
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sakkadentraining.ch</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
  </head>

  <body>
    <div class="login-wrapper">
      <div class="login-left">
        <div class="branding">
          <img src="images/logo.png" alt="Logo" class="login-logo" />
          <h1 class="login-title">Sakkadentraining.ch</h1>
        </div>

        <!-- Login Form -->
        <form class="login-form">
          <label for="loginUsername">Benutzername</label>
          <input type="text" id="loginUsername" name="loginUsername" required />
          <label for="password">Passwort</label>
          <input type="password" id="loginPassword" required />
          <div class="login-actions">
            <button id="loginBtn" type="button" class="login-btn login-btn--primary">Login</button>
          </div>
        </form>

        <!-- Action Links -->
        <div class="login-links">
          <p class="login-text centered-text">Noch kein Konto? <button class="link-btn"
              id="openRegister">Registrieren!</button></p>
          <div class="inline-links">
            <button class="link-btn" id="openReset">Passwort vergessen</button>
            <span>|</span>
            <button class="link-btn" id="openDelete">Konto löschen</button>
          </div>
        </div>

        <!-- Panels (inside login-left only) -->
        <div class="form-panel" id="registerPanel">
          <form class="login-form small-form" id="registerFormInner">
            <h2>Registrieren</h2>

            <label for="registerUsername" class="bold">Benutzername:</label>
            <div style="position: relative; width: 100%;">
              <input type="text" id="registerUsername" required />
              <span id="usernameStatus"
                style="position: absolute; right: 1vw; top: 50%; transform: translateY(-50%); font-size: 1.2vw;"></span>
            </div>

            <label for="registerEmail" class="bold">E-Mail Adresse:</label>
            <input type="email" id="registerEmail" required />

            <label class="bold">Ich bin:</label>
            <select id="registerUserType">
              <option value="Therapeut:in">Therapeut:in</option>
              <option value="Privatperson">Privatperson</option>
              <option value="keine Angabe">keine Angabe</option>
            </select>

            <label for="registerPurpose" class="bold">Wozu nutzen Sie das Sakkadentraining?</label>
            <input type="text" id="registerPurpose" />

            <div class="login-actions">
              <button type="button" class="login-btn close-panel">Zurück</button>
              <button type="submit" class="login-btn">Registrieren</button>
            </div>

            <p id="registerMessage" class="feedback-msg" style="display: none;"></p>
          </form>
        </div>

        <div class="form-panel" id="resetPanel">
          <form class="login-form small-form" onsubmit="event.preventDefault(); sendReset();">
            <h2>Passwort zurücksetzen</h2>
            <label for="resetEmail" class="bold">E-Mail:</label>
            <input type="email" id="resetEmail" required />
            <div class="login-actions">
              <button type="button" class="login-btn close-panel">Zurück</button>
              <button type="submit" class="login-btn">Senden</button>
            </div>
            <p id="resetMessage" class="feedback-msg" style="display: none;"></p>
          </form>
        </div>

        <div class="form-panel" id="deletePanel">
          <form class="login-form small-form" onsubmit="event.preventDefault(); sendDelete();">
            <h2>Account löschen</h2>
            <label for="deleteUsername" class="bold">Benutzername:</label>
            <input type="text" id="deleteUsername" required />

            <label for="deletePassword" class="bold">Passwort:</label>
            <input type="password" id="deletePassword" required />

            <p style="font-size: 0.8vw; font-style: italic; text-align: center; margin-top: 1vh;">
              Hiermit bestätige ich, dass ich die Löschung meines Accounts sowie aller assoziierten Lizenzen und
              gespeicherten Profile wünsche und verstanden habe, dass dieser Vorgang unwiderruflich ist.
            </p>

            <div style="display: flex; align-items: center; justify-content: center; margin: 1vh 0;">
              <input type="checkbox" id="confirmDelete" style="margin-right: 0.5vw;" />
              <label for="confirmDelete">Ich bestätige.</label>
            </div>

            <div class="login-actions">
              <button type="button" class="login-btn close-panel">Zurück</button>
              <button type="submit" class="login-btn danger">Löschen</button>
            </div>

            <p id="deleteMessage" class="feedback" style="display: none;"></p>
          </form>
        </div>
      </div>

      <div class="login-right">
        <div class="nav-wrapper">
          <div id="leftNavBar" class="nav-bar">
            <img id="leftNavArrow" src="images/left-arrow.png" alt="Zurück" class="nav-arrow-img" />
          </div>
          <div class="page-container">

            <!-- Slide 1: Willkommen -->
            <div class="page-section active" id="page1">
              <h1>Willkommen bei Sakkadentraining.ch!</h1><br>
              <p>
                Bei Sakkadentraining.ch handelt es sich um eine Webseite mit verschiedenen Übungen, um <i>Sakkaden</i>
                (Blickfolgebewegungen) zu trainieren.<br><br>
                Sakkaden sind schnelle, ruckartige Augenbewegungen, die es uns ermöglichen, unseren Blick schnell von
                einem Punkt zum anderen zu verschieben. Sie sind wesentlich für die visuelle Wahrnehmung, da sie ein
                effizientes Abtasten unserer Umgebung ermöglichen. Während einer Sakkade unterdrückt das Gehirn die
                visuelle Eingabe, um Unschärfe zu verhindern, sodass wir ein stabiles Bild wahrnehmen. Sakkaden dienen
                dazu, Objekte von Interesse in die Fovea zu bringen, wo die Sehschärfe am höchsten ist. Diese Bewegungen
                werden von Hirnregionen wie den frontalen Augenfeldern und dem superioren Colliculus gesteuert.<br><br>
                Sakkadentraining.ch entstand mit der Idee, ein einfaches und web-basiertes Sakkadentraining zu
                konzipieren, welches von Therapeutinnen und Privatpersonen genutzt werden kann. Dabei bietet es
                verschiedene Funktionen und Einstellungen, um das Training individuell anzupassen.
              </p>
              <img src="images/overview.png" alt="Übersicht" class="beispiel"><br><br>

              <h2>Übungen</h2>
              <p>
                Sakkadentraining.ch bietet Ihnen verschiedene Übungen, um spielerisch zu trainieren. Neben zwei
                verschiedenen Aufwärmübungen (Aufwärmen 1, Aufwärmen 2) und drei einfach gehaltenen Übungen (Normal,
                Folgen, Punkte) stehen Ihnen auch 6 Spiele (Vergleich, Reihenfolge, Fangen, Schwimmen, Schiessen und
                Autofahren) zur Verfügung. Mehr dazu
                im Abschnitt "<strong>Übungen</strong>". Mittels Einstellungen lassen sich die Spiele nach belieben in
                ihrer
                Schwierigkeit und Anforderung variieren.
                Ebenfalls lassen sich die zu trainierenden Bereiche des Gesichtsfelds für die meisten Übungen genau
                einstellen.
              </p>
              <img src="images/examplesettings.png" alt="Settins" class="beispiel"><br><br>

              <h2>Profile</h2>
              <p>
                Sakkadentraining.ch verfügt über eine Profil-Funktion, um individuelle Einstellungen für die verschiedenen
                Übungen sitzungsübergreifend zu speichern. Zudem erlaubt die Verwendung von Profilen jeweils die Analyse
                der gespeicherten Daten mittels Daten-Interface. Die Trainings werden jeweils so ausgerichtet, dass der
                ausgewählte Trainingsbereich des Blickfeldes gleichmässig (auch basierend auf früheren Trainings)
                trainiert wird.
              </p>
              <p><b>Wichtig</b>: Auf der Webseite sollen keine patientenbezogenen Informationen eingegeben werden! Bitte
                verwenden Sie jeweils Pseudonyme.</p>
              <img src="images/exampleprofiles.png" alt="Profile" class="beispiel"><br><br>

              <h2>Kosten</h2>
              <p>
                Diese Webseite ist ein Hobby-Projekt von mir, und ich trage derzeit alle Kosten selbst. Im Moment kann die
                Seite <b>völlig kostenlos</b> genutzt werden. Bitte beachten Sie jedoch, dass ich in Zukunft eine geringe
                jährliche Lizenzgebühr erheben werde, um die laufenden Kosten für den Betrieb der Seite zu decken.
              </p><br>

              <h2>Feedback</h2>
              <p>
                Ich bin stets bemüht, die Seite zu verbessern. Wenn Sie also Feedback oder Vorschläge haben, zögern Sie
                bitte nicht, mich unter <a href="mailto:info@sakkadentraining.ch">info@sakkadentraining.ch</a> zu
                kontaktieren.
              </p>
            </div>

            <!-- Slide 2: Übungen -->
            <div class="page-section" id="page2">
              <h1>Übungen</h1>
              <h2>Leer</h2>
              <p>Leer ist ein freier Explorationsmodus ohne Reaktionsanforderung.
                Es werden visuelle Bewegungsreize (z. B. OKS) auf einem leeren Hintergrund dargestellt.
                Ziel ist es, visuelle Aufmerksamkeit und Blickführung ohne Zeitdruck oder Bewertung zu aktivieren.
                Der Modus bietet eine neutrale Fläche zur Beobachtung des visuellen Verhaltens.
                Er eignet sich insbesondere zur Einstimmung oder zur Nutzung in Ruhephasen.</p>

              <h2>Aufwärmen</h2>
              <p>Dieser Modus kombiniert optional strukturierte Hintergründe mit OKS und eignet sich zur visuellen
                Aktivierung.
                Es erfolgt keine aktive Aufgabenstellung.
                Die Darstellung kann farbig oder schwarz-weiss konfiguriert werden.
                Der Modus bietet visuelle Reize zur Vorbereitung oder Übergangsphase vor strukturierten Einheiten.
                Ideal zur Einleitung einer Sitzung.</p>

              <h2>Normal</h2>
              <p>Dieser Modus zeigt einzelne Zielreize in zufälligen Bereichen des Bildschirms nach einer Fixationsphase.
                Die Aufgabe besteht darin, auf das Erscheinen des Reizes zu reagieren – per Tastendruck, Klick oder
                Tippen.
                Die Zielpositionen werden durch ein vordefiniertes Raster bestimmt. Die Dauer des Reizes und die Anzahl
                der
                Durchgänge sind einstellbar.
                Der Modus eignet sich als standardisierte Trainingsform mit klar definiertem Ablauf.</p>
              <img src="images/normal.png" alt="Normal" class="beispiel"><br><br>

              <h2>Folgen</h2>
              <p>Dieser Modus entspricht funktional dem Normal-Modus, ergänzt jedoch um eine Bewegungskomponente.
                Der Reiz bewegt sich zunächst in Richtung seiner Zielposition und bleibt dort stehen, bis eine Reaktion
                erfolgt oder die Zeit abläuft.
                Die Bewegungsrichtung dient zur visuellen Orientierung. Der Ablauf bleibt ansonsten unverändert: nach dem
                Erscheinen folgt eine Reaktionsphase.
                Der Modus eignet sich zur Beobachtung zielgerichteter visueller Führung.</p>
              <img src="images/folgen.png" alt="Folgen" class="beispiel"><br><br>

              <h2>Punkte</h2>
              <p>Mehrere Zielpunkte erscheinen gleichzeitig auf dem Bildschirm.
                Die Aufgabe besteht darin, auf die Gesamtheit zu reagieren, sofern ihre Anzahl mit einer vorher
                festgelegten
                Zielzahl übereinstimmt.
                Die Reaktion erfolgt innerhalb eines definierten Zeitfensters.
                Reaktionen außerhalb dieses Fensters oder bei abweichender Punktzahl werden als fehlerhaft gewertet.
                Die Punktkonfiguration ist frei wählbar.</p>
              <img src="images/punkte.png" alt="Punkte" class="beispiel"><br><br>

              <h2>Vergleich</h2>
              <p>Zwei Bildraster mit annähernd identischem Inhalt werden nebeneinander angezeigt.
                In genau einem Feld befindet sich ein abweichendes Element.
                Ziel ist es, diese Abweichung visuell zu identifizieren und auszuwählen.
                Die Darstellung ist zeitlich begrenzt; die Antwort erfolgt durch Auswahl eines Bildes.
                Der Modus dient dem Training der visuell-räumlichen Aufmerksamkeit und Exploration.</p>
              <img src="images/vergleich.png" alt="Vergleich" class="beispiel"><br><br>

              <h2>Reihenfolge</h2>
              <p>Mehrere nummerierte Objekte werden gleichzeitig dargestellt.
                Die Aufgabe besteht darin, diese in aufsteigender Reihenfolge auszuwählen.
                Jede Auswahl löst ein visuelles Feedback aus.
                Die Positionen der Objekte sowie deren Anzahl können konfiguriert werden.
                Der Modus bietet eine strukturierte Abfolge für wiederholbare Eingabemuster.</p>
              <img src="images/reihenfolge.png" alt="Reihenfolge" class="beispiel"><br><br>

              <h2>Fangen</h2>
              <p>Ein bewegter Reiz (Ball) wird mit konfigurierbarer Geschwindigkeit auf ein Torbereich zugespielt.
                Ziel ist es, den Reiz durch Reaktion innerhalb des Zielbereichs zu stoppen.
                Die Trefferzone ist durch die Breite und Position des Tores definiert.
                Erfolgreiche und nicht erfolgreiche Versuche werden jeweils rückgemeldet.
                Der Modus eignet sich für visuell-motorische Reaktionserfassung unter klaren Rahmenbedingungen.</p>
              <img src="images/fangen.png" alt="Fangen" class="beispiel"><br><br>

              <h2>Schwimmen</h2>
              <p>In diesem Modus erscheinen mehrere animierte Objekte (Enten), die sich in Richtung eines Zielreizes
                (Brotstück) bewegen.
                Die Reaktion soll erfolgen, bevor die vorauslaufenden Objekte das Ziel erreichen.
                Die Bewegung der Objekte dient dabei als Hinweisreiz zur Zielposition.
                Der Modus kombiniert Zielverfolgung mit Hinweisreizen.</p>
              <img src="images/schwimmen.png" alt="Schwimmen" class="beispiel"><br><br>

              <h2>Schiessen</h2>
              <p>Visuelle Reize (Ballons) steigen einzeln vom unteren Bildschirmrand auf.
                Es erscheinen sowohl Zielreize als auch visuell ähnliche Distraktoren.
                Ziel ist es, nur auf definierte Reize zu reagieren, während andere unbeachtet bleiben.
                Die Darstellung erfolgt kontinuierlich mit variabler Verzögerung.
                Der Modus dient dem Training selektiver Reaktion auf bewegte visuelle Reize.</p>
              <img src="images/schiessen.png" alt="Schiessen" class="beispiel"><br><br>

              <h2>Autofahren</h2>
              <p>Ein zentral gesteuertes Fahrzeug bewegt sich automatisch auf einer zweispurigen Straße.
                Während der Fahrt erscheinen periphere visuelle Stimuli (Verkehrszeichen) sowie Hindernisse auf der
                Fahrbahn.
                Die Aufgabe besteht darin, Stimuli gezielt zu identifizieren und dabei rechtzeitig auszuweichen.
                Der Modus verbindet in einer Dual-Task zentrales Bewegungsgeschehen mit peripheren
                Entscheidungsanforderungen.</p>
              <img src="images/autofahren.png" alt="Autofahren" class="beispiel"><br><br>
            </div>

            <!-- Slide 3: Dateninterface -->
            <div class="page-section" id="page3">
              <h1>Datenvisualisierung und -analyse</h1>
              <p>Sakkadentraining.ch ermöglicht Ihnen die detaillierte Auswertung Ihrer Trainingsdaten.
                Mit dem Daten-Interface erhalten Sie einen klaren Einblick in Ihre Fortschritte und können Ihre Leistungen
                gezielt analysieren und verbessern.
                Falls Sie verschiedene Profile angelegt haben köknnen Sie mittels Suchfunktion nach Profilen zu suchen und
                diese für die Analyse auszuwählen.</p>
              <p>Für alle Übungen – mit Ausnahme der Aufwärmübungen – stellt das Daten-Interface Ihre Trainingsdaten
                anschaulich dar.
                Die Visualisierungen helfen Ihnen, Ihre Leistungen besser zu verstehen und gezielt zu trainieren.</p>
              <p>Anhand der integrierten Filterfunktion können Sie Ihre Daten auf bestimmte Datumsintervalle eingrenzen.
                Dies ist besonders praktisch, um beispielsweise nur Ihren aktuellen Fortschritt zu betrachten oder
                Veränderungen über einen längeren Zeitraum hinweg zu analysieren.
                Der Filter lässt sich bei Bedarf einfach wieder entfernen, sodass Sie flexibel zwischen verschiedenen
                Ansichten wechseln können.</p><br><br>


              <h2>Detaillierte Analyse für "Normal", "Folgen" und "Schwimmen"</h2>
              <p>Die Übungen "Normal" und "Folgen" sowie das Spiel "Schwimmen" bieten Ihnen einen graphischen Überblick
                über
                Ihre Genauigkeit und
                Reaktionszeiten in den trainierten Bereichen über alle Sitzungen hinweg. Die Reaktionszeiten werden dabei
                farblich codiert:</p>
              <ul>
                <li><span style="color: #8CD47E;"><strong>Hellgrün</strong></span>: bis 300 ms</li>
                <li><span style="color: #7ABD7E;"><strong>Dunkelgrün</strong></span>: bis 500 ms</li>
                <li><span style="color: #F8D66D;"><strong>Gelb</strong></span>: bis 700 ms</li>
                <li><span style="color: #FFB54C;"><strong>Orange</strong></span>: bis 1000 ms</li>
                <li><span style="color: #FF6961;"><strong>Rot</strong></span>: über 1000 ms</li>
              </ul>
              <img src="images/example1.png" alt="Beispiel 2" class="beispiel"><br><br>
              <p>Zusätzlich zeigen diese Übungen eine detaillierte Darstellung pro Sitzung, wobei die Genauigkeiten als
                Balken und die Reaktionszeiten als Linien visualisiert werden.</p>
              <img src="images/example2.png" alt="Beispiel 1" class="beispiel"><br><br>

              <h2>Balkendiagramme für "Punkte", "Vergleich", "Fangen", "Schiessen" und "Autofahren"</h2>
              <p>Bei den spielerischen Übungen werden Ihre Leistungen mittels Balkendiagrammen und farblicher
                Kodierung dargestellt. Diese zeigen die prozentualen Anteile folgender Kategorien:</p>
              <ul>
                <li><span style="color: #8CD47E;"><strong>Treffer</strong></span>: richtige Reaktionen innerhalb des
                  Antwortfensters</li>
                <li><span style="color: #F8D66D;"><strong>Verspätete Antworten</strong></span>: richtige Reaktionen
                  außerhalb des Antwortfensters</li>
                <li><span style="color: #FFB54C;"><strong>Verpasste Antworten</strong></span>: ausgelassene oder verpasste
                  Reaktionen</li>
                <li><span style="color: #FF6961;"><strong>Falsche Reaktionen</strong></span>: inkorrekte Antworten</li>
              </ul><br><br>
              <img src="images/example4.png" alt="Beispiel 4" class="beispiel"><br><br>

              <h2>Trefferquote und Reaktionszeit bei "Reihenfolge"</h2>
              <p>Für die Übung "Reihenfolge" wird – ähnlich wie bei "Normal" und "Folgen" – die Trefferquote (prozentualer
                Anteil richtiger Klicks an den gesamten Klicks) als Balken dargestellt.
                Die Reaktionszeit zur Ausführung der Aufgabe wird als Linie pro Sitzung visualisiert, sodass Sie Ihre
                Entwicklung klar nachvollziehen können.</p>
              <img src="images/example5.png" alt="Beispiel 5" class="beispiel"><br><br>

              <h2>Reaktionszeit Links und Rechts bei "Autofahren"</h2>
              <p>Der Modus Autofahren bietet ihnen zudem die Reaktionszeiten auf Stimuli der linken und rechten Seite, um
                allfällige Verlangsamungen in einer Gesichtsfeldhälfte festzuhalten.</p>
              <img src="images/example3.png" alt="Beispiel 3" class="beispiel"><br><br>

              <h2>Verwaltung Ihrer Trainingssitzungen</h2>
              <p>Unterhalb der graphischen Darstellungen finden Sie eine Übersicht aller Ihrer Trainingssitzungen. Diese
                können Sie bei Bedarf löschen, um Ihre Datenbank aufgeräumt und übersichtlich zu halten.</p>
            </div>

            <!-- Slide 4: Über mich -->
            <div class="page-section" id="page4">
              <img src="images/portrait.jpg" alt="Portrait" class="portrait">
              <p>Guten Tag! Ich bin Dr. phil. Romain Ghibellini, gegenwärtig Assistenzpsychologe in der
                Neurorehabilitation der Universitätsklinik für Neurologie am Standort Riggisberg. <br> <br>
                Im Rahmen meiner Doktorarbeit hatte ich die Gelegenheit, mich dem Programmieren von Spielen zu widmen und
                habe grosse Freude daran gefunden.
                Durch meine Arbeit und meinem Kontakt mit Patienten entschloss ich mich kurzerhand, selbstständig ein
                web-basiertes Sakkadentraining zu programmieren,
                um dieses nach meinen Wünschen und den Wünschen meiner Arbeitskolleginnen anpassen zu können.</p>
            </div>

            <!-- Slide 5: Datenschutz -->
            <div class="page-section" id="page5">
              <h1>Datenschutzbestimmungen</h1>
              <h2>Grundsatz und Geltungsbereich</h2>
              <p>Diese Datenschutzinformation bezieht sich auf die Verarbeitung von personenbezogenen Daten im
                Zusammenhang mit dem Besuch der Websites unter www.sakkadentraining.ch.
                Um unsere Websites und die damit verbundenen Online-Dienstleistungen oder Online-Anwendungen
                (zusammenfassend Services genannt) nutzen zu können, verarbeiten wir Ihre personenbezogenen Daten (im
                Folgenden auch als 'Daten' bezeichnet).
                Bitte beachten Sie, dass diese Datenschutzinformation nicht für Websites anderer Anbieter gilt, auf die
                unsere Website möglicherweise verlinkt ist.<br>
                <br>Personenbezogene Daten beziehen sich auf Informationen, die sich auf eine bestimmte oder bestimmbare
                natürliche Person beziehen.
                Bestimmte Kategorien von besonders sensiblen personenbezogenen Daten, wie beispielsweise Gesundheitsdaten,
                werden durch spezielle gesetzliche Bestimmungen besonders geschützt.
                Unter dem Begriff Bearbeitung fallen sämtliche Vorgänge im Zusammenhang mit Ihren Daten, einschliesslich
                Erhebung, Speicherung, Nutzung, Weitergabe, Archivierung oder Löschung.
                Bei der Datenverarbeitung halten wir uns an das Bundesgesetz über den Datenschutz (DSG), die entsprechende
                Durchführungsverordnung (DSGV) sowie an andere geltende Datenschutzgesetze (z. B. die Europäische
                Datenschutz-Grundverordnung, DSGVO), sofern diese anwendbar sind.<br>
                <br>Im Folgenden möchten wir Ihnen erläutern, welche Daten wir erheben, zu welchem Zweck wir sie verwenden
                und welche Rechte Sie in Bezug auf Ihre Daten haben.
                Sofern Sie uns Daten über Dritte übermitteln, gehen wir davon aus, dass Sie dazu berechtigt sind und dass
                die übermittelten Daten korrekt sind.
                Wir bitten Sie daher, die betreffenden Dritten über die Verarbeitung ihrer Daten durch uns zu informieren
                und ihnen eine Kopie dieser Datenschutzinformation oder der relevanten Produktinformationen zu übergeben.
                Sollten wir Sie auf eine aktualisierte Version dieser Dokumente hinweisen, bitten wir Sie, auch diese
                neuen Versionen weiterzugeben.<br>
                <br>Unsere Mitarbeiter werden regelmässig in Datenschutzfragen geschult und unterliegen der
                Geheimhaltungspflicht.
                Zudem wird die Einhaltung der datenschutzrechtlichen Bestimmungen von unserer Datenschutzfachstelle
                überwacht.
              </p><br><br>


              <h2>Verantwortliche Stellen und Kontakt</h2>
              <p>Verantwortlich für die in dieser Datenschutzerklärung beschriebene Verarbeitung von Daten ist:<br>
                <br>Romain Ghibellini
                <br>Morillonstrasse 48
                <br>3007 Bern<br>
                <br>Bei Fragen und Anliegen rund um die Verarbeitung Ihrer Daten sowie Ihrer datenschutztechnischen Rechte
                uns gegenüber wenden Sie sich bitte an:<br>
                <br>Romain Ghibellini
                <br>Morillonstrasse 48
                <br>3007 Bern
                <br>E-Mail: info@sakkadentraining.ch
              </p><br><br>


              <h2>Bearbeitete Daten</h2>
              <p>Wir legen grossen Wert auf den Schutz Ihrer personenbezogenen Daten.
                Bei der Nutzung unserer Webseite und Services verarbeiten wir in erster Linie die für die Nutzung
                notwendigen Daten, die Sie uns übermitteln sowie die von uns direkt erhobenen Informationen (siehe
                unten).<br>
                <br>Im Zuge der Nutzung unserer Webseite und Services erfassen wir Metadaten, wie zum Beispiel
                Informationen zu Ihrem Browser (Typ und Version), Ihrem Gerätetyp (z. B. Smartphone oder Tablet) und Ihrer
                IP-Adresse.
                Des Weiteren erheben wir Zugriffsdaten, auch Protokolldaten genannt.
                Diese beinhalten den Namen der aufgerufenen Website, Datum und Uhrzeit des Zugriffs, übertragene
                Datenmenge, Meldung über einen erfolgreichen Abruf, Informationen zum Betriebssystem sowie Angaben zur
                zuletzt besuchten Website.<br>
                <br>Weitere Daten zu Ihrer Person speichern und verarbeiten wir nur, wenn Sie diese im Zuge der Nutzung
                von Services und Tools (z.B. Kontaktformular) an uns übermitteln.
                Weitere datenschutzrelevante Informationen für spezifische Tools finden Sie gegebenenfalls weiter unten in
                dieser Datenschutzerklärung.
              </p><br><br>


              <h2>Zweck</h2>
              <p>Wir verarbeiten Ihre Daten ausschliesslich für die Zwecke, die wir Ihnen bei der Erhebung Ihrer Daten
                mitgeteilt haben, sowie für andere mit diesen Zielen vereinbare Zwecke.
                Weitere Informationen über die Grundlagen unserer Datenverarbeitung finden Sie weiter unten in dieser
                Datenschutzerklärung.</p><br><br>


              <h2>Verarbeitung der Daten</h2>
              <p>Wir verarbeiten Ihre Daten für verschiedene Zwecke im Zusammenhang mit der Kommunikation mit Ihnen.
                Dies umfasst insbesondere die Beantwortung von Anfragen, die Geltendmachung Ihrer Rechte und die
                Kontaktaufnahme bei Rückfragen.
                Dabei nutzen wir vor allem Kommunikationsdaten und Stammdaten, sowie Registrierungsdaten in Bezug auf von
                Ihnen genutzte Angebote und Dienstleistungen.
                Diese Daten können für Dokumentationszwecke, Schulungen, Qualitätssicherung und Nachfragen gespeichert
                werden.<br>
                <br>Des Weiteren verarbeiten wir Daten für Marketingzwecke und zur Pflege der Kundenbeziehung.
                Wir können allgemeine oder personalisierte Informationen zu unserem Angebot an unsere Nutzer senden,
                beispielsweise in Form unregelmässiger Kontakte per E-Mail, Post oder Telefon, sowie über andere Kanäle,
                für die wir Kontaktinformationen von Ihnen haben.
                Sie haben jederzeit die Möglichkeit, solche Kontakte abzulehnen oder Ihre Einwilligung zur Kontaktaufnahme
                für Werbezwecke zu verweigern oder zu widerrufen.
                Mit Ihrer Einwilligung können wir unser Online-Angebot gezielter auf die Bedürfnisse unserer Nutzer
                ausrichten.<br>
                <br>Des Weiteren können wir Ihre Daten für Marktforschung, zur Verbesserung unseres Online-Angebots,
                unserer Dienstleistungen und allenfalls zur Produktentwicklung nutzen.<br>
                <br>Schliesslich können wir Ihre Daten auch aus Sicherheitsgründen und zur Zugangskontrolle auf unserer
                Webseite speichern und verarbeiten.
              </p><br><br>


              <h2>Logfiles</h2>
              <p>Wir nutzen hauptsächlich Daten zur Erstellung von Server-Logfiles, um statistische Auswertungen für den
                Betrieb der Website durchzuführen, die Sicherheit der IT-Systeme zu gewährleisten und die Website zu
                optimieren.
                Hierbei verwenden wir vorrangig Protokolldaten.
                Die rechtliche Grundlage für diese Datenverarbeitung ist unser berechtigtes Interesse, Ihnen jederzeit
                eine sichere und reibungslose Nutzungserfahrung zu bieten.
                Wir behalten uns ausserdem das Recht vor, die Protokolldaten nachträglich zu überprüfen, wenn konkrete
                Anhaltspunkte für eine rechtswidrige Nutzung bestehen.</p><br><br>


              <h2>Kontaktformular</h2>
              <p>Wenn Sie uns über das Kontaktformular kontaktieren, erfassen wir Ihre Kontaktdaten, um Ihre Anfrage zu
                bearbeiten und eventuelle Nachfragen zu beantworten.
                Die Übermittlung dieser Daten erfolgt in verschlüsselter Form.<br>
                <br>Wenn Sie uns Ihre E-Mail-Adresse angegeben haben oder uns direkt per E-Mail kontaktiert haben, können
                wir Ihnen auch Informationen per E-Mail zusenden, die im Zusammenhang mit der Bearbeitung Ihrer Anliegen
                und Fragen stehen.<br>
                <br>Die rechtliche Grundlage für die Verarbeitung Ihrer Daten beruht auf unserem berechtigten Interesse,
                Ihre Online-Anfrage effizient und effektiv bearbeiten zu können.
                Wenn das Ziel des E-Mail-Kontakts der Abschluss eines Vertrags ist, basiert die Datenverarbeitung auf der
                Anbahnung dieser vertraglichen Beziehung.
              </p><br><br>


              <h2>Google Fonts</h2>
              <p>Wir können auf unserer Webseite Google Fonts nutzen um ausgewählte Schriftarten sowie Icons und Symbole
                auf unserer Website anzuzeigen.
                Dabei handelt es sich um einen Dienst, bereitgestellt von Google LLC (1600 Amphitheatre Parkway, Mountain
                View, CA 94043, USA).<br>
                <br>Weiterführende Informationen zu Google Fonts finden sie unter folgendem Link:
                developers.google.com/fonts/faq/privacy?hl=de
              </p><br><br>


              <h2>Benutzerkonten</h2>
              <p>Wir können für Benutzer auf unserer Webseite Benutzerkonten anlegen.</p><br><br>


              <h2>IP Anonymisierung</h2>
              <p>Ihre IP-Adresse wird bei unserer Webseite vor der Übertragung an Google standardmässig anonymisiert.
                Dies geschieht, indem Ihre Adresse nur in gekürzter Form übertragen wird.
                In Ausnahmefällen kann es vorkommen, dass Ihre Adresse vollständig übertragen und erst im Rechenzentrum
                von Google gekürzt wird.</p><br><br>


              <h2>Ihre Rechte</h2>
              <p>Sie haben nach Massgabe des anwendbaren Datenschutzrechts gemäss den geltenden Datenschutzbestimmungen
                und unter bestimmten Voraussetzungen folgende Rechte:<br>
                <br>Recht auf Auskunft: Sie können von uns Informationen darüber verlangen, ob wir Ihre personenbezogenen
                Daten verarbeiten und welche Daten dies gegebenenfalls sind.<br>
                <br>Recht auf Berichtigung: Sie können von us die Korrektur falscher Daten oder die Vervollständigung
                unvollständiger Daten verlangen.<br>
                <br>Recht auf Löschung: Sie können die Löschung Ihrer Daten verlangen. Beachten Sie jedoch, dass bestimmte
                gesetzliche Bestimmungen oder berechtigte Interessen unsere Verpflichtung zur Löschung einschränken
                können.<br>
                <br>Recht auf Datenübertragbarkeit: Unter bestimmten Voraussetzungen können Sie verlangen, dass wir Ihnen
                die von Ihnen bereitgestellten Daten in einem strukturierten, gängigen und maschinenlesbaren Format zur
                Verfügung stellen.<br>
                <br>Recht auf Widerruf der Einwilligung: Wenn die Datenverarbeitung auf Ihrer Einwilligung beruht, können
                Sie diese Einwilligung jederzeit widerrufen.
                Bitte beachten Sie, dass der Widerruf die Rechtmässigkeit der bis zum Widerruf erfolgten Datenverarbeitung
                nicht berührt.<br>
                <br>Recht auf Widerspruch: Sie haben unter bestimmten Umständen das Recht, der Verarbeitung Ihrer Daten,
                insbesondere für Zwecke des Direktmarketings oder der berechtigten Interessen, zu widersprechen.<br>
                <br> Beschwerderecht: Wenn Sie mit unserem Umgang Ihrer Daten nicht einverstanden sind, haben Sie das
                Recht, sich an unsere Datenschutzbeauftragten oder unter edoeb.admin.ch an die zuständige
                Datenschutzaufsichtsbehörde zu wenden.<br>
                <br> Bitte beachten Sie, dass diese Rechte gesetzlichen Voraussetzungen unterliegen und dass Ausnahmen und
                Einschränkungen gelten können.
                Um Ihre Rechte wahrzunehmen, können Sie uns schriftlich oder per E-Mail an die untenstehende Adresse
                kontaktieren.
                <br>Romain Ghibellini<br>
                <br>Datenschutzfachstelle
                <br>Morillonstrasse 48
                <br>3007 Bern
                <br> E-Mail: r.ghibellini@gmail.com
              </p><br><br>


              <h2>SSL</h2>
              <p>Aufgrund der technischen Struktur des Internets als offenes Netzwerk kann eine sichere Übermittlung Ihrer
                Daten nicht in allen Fällen garantiert werden.
                Wenn Sie Ihre persönlichen Daten an uns senden, dann geschieht dies immer auf eigenes Risiko.<br>
                <br>Um den Schutz Ihrer übermittelten Daten zu gewährleisten, verwenden wir Verschlüsselungsmechanismen
                gemäss den aktuellen Sicherheitsstandards (Transport Layer Security, TLS).
                TLS ist ein Protokoll zur sicheren Datenübertragung im Internet und wird von den meisten Browsern
                unterstützt.
                Es nutzt das Public-Key-Verfahren, bei dem Daten mit einem öffentlich zugänglichen Schlüssel verschlüsselt
                und nur mit einem spezifischen privaten Schlüssel wieder entschlüsselt werden können.
                Die meisten Browser zeigen anhand eines Schlüsselsymbols oder Vorhängeschlosses an, ob eine Verbindung
                sicher ist.<br>
                <br>Wir treffen diverse technische und organisatorische Sicherheitsvorkehrungen, um den Schutz Ihrer Daten
                innerhalb unseres Systems zu gewährleisten.
                Dennoch möchten wir Sie darauf hinweisen, dass trotz dieser Massnahmen das Risiko von Datenverlust,
                unbefugtem Zugriff auf oder Manipulation der Daten durch Dritte besteht.
                Bitte beachten Sie zudem, dass gewisse Netzwerkabschnitte und Ihr Computer ausserhalb unseres
                kontrollierbaren Sicherheitsbereichs liegen.
                Als Benutzer sind Sie dafür verantwortlich, sich über erforderliche Sicherheitsvorkehrungen zu informieren
                und die nötigen Massnahmen innerhalb Ihres Einflussbereiches zu ergreifen.
                Eine Haftung unsererseits für Schäden, welche Ihnen durch Datenverlust oder -manipulation entstehen, ist
                grundsätzlich ausgeschlossen.
              </p><br><br>


              <h2>Aufbewahrung der Daten</h2>
              <p>Wir speichern Ihre Daten lediglich so lange, wie es für die von uns genannten Zwecke notwendig ist oder
                wie wir gesetzlich oder vertraglich verpflichtet sind.
                Daten, welche für die genannten Zwecke auch in Zukunft nicht mehr notwendig sind werden von uns im Rahmen
                unserer regulären Datenpflege gelöscht oder alternativ anonymisiert.</p><br><br>


              <h2>Update</h2>
              <p>Die vorliegende Datenschutzinformation ist nicht Vertragsbestandteil und jederzeit durch uns abänderbar.
                Es gilt jeweils die hier veröffentlichte Version.<br>
                <br>Letztmals aktualisiert am 8. März, 2025
              </p>
            </div>
          </div>
        </div>
        <div id="rightNavBar" class="nav-bar nav-bar-right">
          <img id="rightNavArrow" src="images/right-arrow.png" alt="Weiter" class="nav-arrow-img" />
        </div>
        <div id="paginationDots" class="dots"></div>
      </div>
    </div>

    <script>
      window.addEventListener('load', () => {
        const pages = Array.from(document.querySelectorAll('.page-section'));
        let current = 0;

        function showPage(index) {
          pages.forEach(p => p.classList.remove('active'));
          pages[index].classList.add('active');
          // Update pagination dots
          const dots = document.querySelectorAll('#paginationDots span');
          dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        }

        document.getElementById('leftNavBar').addEventListener('click', () => {
          current = (current - 1 + pages.length) % pages.length;
          document.querySelector('.login-right').scrollTop = 0;
          showPage(current);
        });

        document.getElementById('rightNavBar').addEventListener('click', () => {
          current = (current + 1) % pages.length;
          document.querySelector('.login-right').scrollTop = 0;
          showPage(current);
        });

        // Initialize pagination dots
        const dotsContainer = document.getElementById('paginationDots');
        pages.forEach((_, i) => {
          const dot = document.createElement('span');
          dot.classList.add('dot');
          if (i === 0) dot.classList.add('active');
          dotsContainer.appendChild(dot);
        });

        showPage(current); // Show the first page on load
      });
    </script>

    <script>
      function debounce(func, wait) {
        let timeout;
        return function (...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), wait);
        };
      }

      // Username availability check with debounce
      document.getElementById('registerUsername').addEventListener('input', debounce(checkUsername, 1000));

      async function checkUsername() {
        const username = document.getElementById('registerUsername').value.trim();
        const statusEl = document.getElementById('usernameStatus');
        if (username.length < 3) { statusEl.innerHTML = ''; return; } try {
          const response = await
            fetch(`login/check_username.php?username=${encodeURIComponent(username)}`); const data = await response.json();
          statusEl.innerHTML = data.available ? '<span style="color: green;">✔</span>' : '<span style="color: red;">✖</span>'
            ;
        } catch (error) { console.error('Username check failed:', error); statusEl.innerHTML = ''; }
      } // Registration
      document.getElementById('registerFormInner').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const userType = document.getElementById('registerUserType').value;
        const purpose = document.getElementById('registerPurpose').value.trim();
        const messageEl = document.getElementById('registerMessage');

        if (!username || !email) {
          messageEl.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
          messageEl.className = 'feedback-msg error';
          messageEl.style.display = 'block';
          return;
        }

        if (document.getElementById('usernameStatus').textContent.includes('✖')) {
          messageEl.textContent = 'Benutzername bereits vergeben.';
          messageEl.className = 'feedback-msg error';
          messageEl.style.display = 'block';
          return;
        }

        const emailCheck = await fetch(`login/check_email.php?email=${encodeURIComponent(email)}`);
        const emailData = await emailCheck.json();
        if (!emailData.available) {
          messageEl.textContent = 'E-Mail Adresse ist bereits registriert.';
          messageEl.className = 'feedback-msg error';
          messageEl.style.display = 'block';
          return;
        }

        const response = await fetch('login/register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:
            `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&user_type=${encodeURIComponent(userType)}&purpose=${encodeURIComponent(purpose)}`
        });

        const data = await response.json();
        if (data.success) {
          messageEl.textContent = 'Registrierung erfolgreich!';
          messageEl.className = 'feedback-msg success';
          messageEl.style.display = 'block';
          setTimeout(() => {
            messageEl.style.display = 'none';
            document.getElementById('registerPanel').classList.remove('active');
          }, 3000);
        } else {
          messageEl.textContent = data.message || 'Registrierung fehlgeschlagen.';
          messageEl.className = 'feedback-msg error';
          messageEl.style.display = 'block';
        }
      });

      // Password Reset
      async function sendReset() {
        const email = document.getElementById('resetEmail').value.trim();
        const msg = document.getElementById('resetMessage');
        if (!email) {
          msg.textContent = 'Bitte geben Sie eine E-Mail Adresse ein.';
          msg.className = 'feedback-msg error';
          msg.style.display = 'block';
          return;
        }

        const response = await fetch('login/reset_password.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `email=${encodeURIComponent(email)}`
        });

        const data = await response.json();
        msg.textContent = data.message;
        msg.className = data.success ? 'feedback-msg success' : 'feedback-msg error';
        msg.style.display = 'block';
      }

      // Delete Account
      async function sendDelete() {
        const username = document.getElementById('deleteUsername').value.trim();
        const password = document.getElementById('deletePassword').value.trim();
        const confirm = document.getElementById('confirmDelete').checked;
        const msg = document.getElementById('deleteMessage');

        if (!username || !password) {
          msg.textContent = 'Bitte Benutzername und Passwort eingeben.';
          msg.className = 'feedback-msg error';
          msg.style.display = 'block';
          return;
        }
        if (!confirm) {
          msg.textContent = 'Bitte bestätigen Sie die Löschung.';
          msg.className = 'feedback-msg error';
          msg.style.display = 'block';
          return;
        }

        const response = await fetch('login/delete_account.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });

        const data = await response.json();
        msg.textContent = data.message;
        msg.className = data.success ? 'feedback-msg success' : 'feedback-msg error';
        msg.style.display = 'block';

        if (data.success) {
          setTimeout(() => {
            msg.style.display = 'none';
            showLoginForm();
          }, 2000);
        }
      }


      // Toggle password visibility
      document.addEventListener('DOMContentLoaded', () => {
        const usernameInput = document.getElementById('registerUsername');
        if (usernameInput) {
          usernameInput.addEventListener('input', debounce(checkUsername, 1000));
        }

        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
          togglePassword.addEventListener('click', () => {
            const input = document.getElementById('loginPassword');
            input.type = input.type === 'password' ? 'text' : 'password';
            togglePassword.textContent = input.type === 'text' ? '👁️‍🗨️' : '👁️';
          });
        }

        // Same for any other inputs/buttons you're attaching events to
      });

      document.addEventListener('DOMContentLoaded', () => {
        const panels = {
          register: document.getElementById('registerPanel'),
          reset: document.getElementById('resetPanel'),
          delete: document.getElementById('deletePanel')
        };

        document.getElementById('openRegister')?.addEventListener('click', () => {
          panels.register.classList.add('active');
        });

        document.getElementById('openReset')?.addEventListener('click', () => {
          panels.reset.classList.add('active');
        });

        document.getElementById('openDelete')?.addEventListener('click', () => {
          panels.delete.classList.add('active');
        });

        document.querySelectorAll('.close-panel').forEach(btn => {
          btn.addEventListener('click', () => {
            Object.values(panels).forEach(p => p.classList.remove('active'));
          });
        });
      });
    </script>

    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const loginBtn = document.getElementById('loginBtn');
        const loginForm = document.querySelector('.login-form'); // the wrapper <form> or div

        if (loginBtn) {
          loginBtn.addEventListener('click', login);

          // 🔑 Press Enter anywhere inside the login form → trigger login
          if (loginForm) {
            loginForm.addEventListener('keydown', (event) => {
              if (event.key === 'Enter') {
                event.preventDefault(); // stop full page reload
                loginBtn.click();       // simulate login button click
              }
            });
          }
        }
      });

      function login() {
        const username = document.getElementById('loginUsername')?.value.trim();
        const password = document.getElementById('loginPassword')?.value.trim();
        const error = document.getElementById('loginError');

        if (!username || !password) {
          error.textContent = 'Bitte geben Sie Benutzername und Passwort ein.';
          return;
        }

        fetch('login/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              sessionStorage.setItem('dataToken', data.token);
              sessionStorage.setItem('playLoginSound', 'true');
              window.location.reload();
            }
            else {
              error.textContent = data.message || 'Login fehlgeschlagen.';
            }
          })
          .catch(() => {
            error.textContent = 'Netzwerkfehler beim Login.';
          });
      }
    </script>

    <audio id="loginSound" preload="auto" src="sounds/login.mp3" style="display: none;"></audio>
  </body>

  </html>
<?php } ?>