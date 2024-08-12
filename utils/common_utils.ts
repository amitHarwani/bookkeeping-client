export const capitalizeText = (text: string) => {
    const wordsInText = text.split(' ');
    
    const transformedWords = wordsInText.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    })
    return transformedWords.join(' ');
}