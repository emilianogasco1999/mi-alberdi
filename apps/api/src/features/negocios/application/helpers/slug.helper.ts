import crypto from 'node:crypto';
import type { INegociosRepository } from '../../domain/repositories/INegociosRepository.js';

export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Quita caracteres especiales
    .replace(/[\s_-]+/g, '-') // Espacios o guiones repetidos a un solo guión
    .replace(/^-+|-+$/g, '') // Quita guiones iniciales o finales
    .substring(0, 80);
};

export const generateUniqueSlug = async (
  nombre: string,
  repository: INegociosRepository,
): Promise<string> => {
  const baseSlug = slugify(nombre) || 'negocio';
  let candidateSlug = baseSlug;
  let counter = 1;

  while (await repository.slugExists(candidateSlug)) {
    counter += 1;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
};

export const generateQrToken = (): string => {
  return crypto.randomBytes(12).toString('hex');
};

