// Voice Navigation Service
class VoiceNavigationService {
  // Web Speech API implementation
  static initSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    return new SpeechRecognition();
  }

  // Synthesize voice directions
  static speakDirection(text) {
    const synth = window.speechSynthesis;

    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    synth.speak(utterance);
  }

  // Generate voice prompts for navigation
  static generateVoicePrompts(directions) {
    return directions.map((dir, index) => {
      const distance =
        dir.distance < 10
          ? "a few meters"
          : `${Math.round(dir.distance)} meters`;
      return `Step ${index + 1}: ${dir.instruction} for ${distance}`;
    });
  }

  // Read out directions
  static readDirections(directions) {
    const prompts = this.generateVoicePrompts(directions);
    let index = 0;

    const readNext = () => {
      if (index < prompts.length) {
        this.speakDirection(prompts[index]);
        index++;
        setTimeout(readNext, 3000);
      }
    };

    readNext();
  }

  // Voice command recognition
  static startVoiceCommands(callbacks) {
    const recognition = this.initSpeechRecognition();
    const commands = {
      repeat: callbacks.repeat,
      "next direction": callbacks.nextDirection,
      "previous direction": callbacks.previousDirection,
      cancel: callbacks.cancel,
      help: callbacks.help,
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      const command = transcript.toLowerCase().trim();
      if (commands[command]) {
        commands[command]();
      }
    };

    recognition.start();
    return recognition;
  }
}

module.exports = VoiceNavigationService;
