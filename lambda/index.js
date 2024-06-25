const Alexa = require('ask-sdk-core');

const metricConversions = {
    "centímetros": { "metros": 0.01, "kilómetros": 0.00001 },
    "metros": { "centímetros": 100, "kilómetros": 0.001 },
    "kilómetros": { "centímetros": 100000, "metros": 1000 }
};

const imperialConversions = {
    "inches": { "feet": 0.0833333, "yards": 0.0277778, "miles": 0.000015783 },
    "feet": { "inches": 12, "yards": 0.333333, "miles": 0.000189394 },
    "yards": { "inches": 36, "feet": 3, "miles": 0.000568182 },
    "miles": { "inches": 63360, "feet": 5280, "yards": 1760 }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const speakOutput = locale.startsWith('es')
            ? 'Bienvenido, puedes pedirme que convierta unidades del sistema métrico. ¿Qué te gustaría intentar?'
            : 'Welcome, you can ask me to convert units from the imperial system. What would you like to try?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ConvertUnitsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConvertUnitsIntent';
    },
    handle(handlerInput) {
        const { requestEnvelope, responseBuilder } = handlerInput;
        const fromUnit = Alexa.getSlotValue(requestEnvelope, 'fromUnit');
        const toUnit = Alexa.getSlotValue(requestEnvelope, 'toUnit');
        const value = parseFloat(Alexa.getSlotValue(requestEnvelope, 'value'));
        const locale = Alexa.getLocale(requestEnvelope);

        let conversionFactor;
        let speakOutput;

        if (locale.startsWith('es')) {
            // Conversiones en español (sistema métrico)
            if (metricConversions[fromUnit] && metricConversions[fromUnit][toUnit]) {
                conversionFactor = metricConversions[fromUnit][toUnit];
                const convertedValue = value * conversionFactor;
                speakOutput = `${value} ${fromUnit} son aproximadamente ${convertedValue.toFixed(2)} ${toUnit}`;
            } else {
                speakOutput = `Lo siento, no puedo convertir de ${fromUnit} a ${toUnit}. Por favor, intenta con otra unidad.`;
            }
        } else {
            // Conversiones en inglés (sistema imperial)
            if (imperialConversions[fromUnit] && imperialConversions[fromUnit][toUnit]) {
                conversionFactor = imperialConversions[fromUnit][toUnit];
                const convertedValue = value * conversionFactor;
                speakOutput = `${value} ${fromUnit} are approximately ${convertedValue.toFixed(2)} ${toUnit}`;
            } else {
                speakOutput = `I'm sorry, I can't convert from ${fromUnit} to ${toUnit}. Please try with another unit.`;
            }
        }

        return responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const speakOutput = locale.startsWith('es')
            ? 'Puedes pedirme que convierta unidades del sistema métrico. Por ejemplo, di "Convierte 10 metros a kilómetros". ¿Cómo te puedo ayudar?'
            : 'You can ask me to convert units from the imperial system. For example, say "Convert 10 feet to yards". How can I help you?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const speakOutput = locale.startsWith('es')
            ? '¡Adiós!'
            : 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const speakOutput = locale.startsWith('es')
            ? 'Lo siento, tuve problemas para hacer lo que pediste. Por favor, intenta de nuevo.'
            : 'Sorry, I had trouble doing what you asked. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ConvertUnitsIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .lambda();
