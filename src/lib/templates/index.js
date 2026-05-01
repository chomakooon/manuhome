import petIllustration from './pet-illustration.json';
import snsIcon from './sns-icon.json';
import businessManga from './business-manga.json';
import portrait from './portrait.json';
import diagram from './diagram.json';

const templates = {
    [petIllustration.id]: petIllustration,
    [snsIcon.id]: snsIcon,
    [businessManga.id]: businessManga,
    [portrait.id]: portrait,
    [diagram.id]: diagram,
};

export function getTemplateById(id) {
    return templates[id] ?? null;
}

export default templates;
