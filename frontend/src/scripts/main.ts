/**
 * Punto de entrada de las interacciones.
 * Los módulos escuchan antes de que el hero anuncie un perfil guardado.
 */
import { initNav } from './nav';
import { initJourney } from './journey';
import { initTools } from './tools';
import { initCalc } from './calc';
import { initRecommender } from './recommender';
import { initCases } from './cases';
import { initHero } from './hero';
import { initLeadForm } from './lead-form';

initNav();
initJourney();
initTools();
initCalc();
initRecommender();
initCases();
initLeadForm();
initHero();
