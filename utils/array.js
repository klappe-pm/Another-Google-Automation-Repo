/**
 * Array utility functions
 * Provides array manipulation and helper utilities
 */

/**
 * Splits an array into chunks of specified size
 * @param {Array} array - Array to split
 * @param {number} chunkSize - Size of each chunk
 * @returns {Array[]} Array of chunks
 */
export function chunk(array, chunkSize) {
  if (!Array.isArray(array) || chunkSize <= 0) return [];
  
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  
  return chunks;
}

/**
 * Removes duplicates from an array
 * @param {Array} array - Array from which to remove duplicates
 * @returns {Array} New array with duplicates removed
 */
export function removeDuplicates(array) {
  if (!Array.isArray(array)) return [];
  
  return [...new Set(array)];
}

/**
 * Flattens a nested array
 * @param {Array} array - Nested array to flatten
 * @returns {Array} Flattened array
 */
export function flatten(array) {
  if (!Array.isArray(array)) return [];
  
  return array.reduce((flat, toFlatten) => {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

/**
 * Finds the maximum value in an array
 * @param {number[]} array - Array of numbers
 * @returns {number} Maximum value
 */
export function max(array) {
  if (!Array.isArray(array) || array.length === 0) return null;
  return Math.max(...array);
}

/**
 * Finds the minimum value in an array
 * @param {number[]} array - Array of numbers
 * @returns {number} Minimum value
 */
export function min(array) {
  if (!Array.isArray(array) || array.length === 0) return null;
  return Math.min(...array);
}

/**
 * Shuffles an array randomly
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffle(array) {
  if (!Array.isArray(array)) return [];
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Randomly selects an element from an array
 * @param {Array} array - Array to select from
 * @returns {any} Randomly selected element
 */
export function randomElement(array) {
  if (!Array.isArray(array) || array.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * Sums the values in an array
 * @param {number[]} array - Array of numbers
 * @returns {number} Sum of values
 */
export function sum(array) {
  if (!Array.isArray(array)) return 0;
  return array.reduce((total, num) => total + num, 0);
}

/**
 * Computes the average of values in an array
 * @param {number[]} array - Array of numbers
 * @returns {number} Average value
 */
export function average(array) {
  if (!Array.isArray(array) || array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * Creates an array of a specified length with a default value
 * @param {number} length - Length of the array
 * @param {any} defaultValue - Default value to fill
 * @returns {Array} Filled array
 */
export function createFilledArray(length, defaultValue = null) {
  if (typeof length !== 'number' || length < 0) return [];
  return new Array(length).fill(defaultValue);
}
