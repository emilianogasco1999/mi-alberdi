import type { ICatalogoRepository } from '../../domain/repositories/ICatalogoRepository.js';

export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
};

export const generateUniquePublicacionSlug = async (
  titulo: string,
  repository: ICatalogoRepository,
): Promise<string> => {
  const baseSlug = slugify(titulo) || 'publicacion';
  let candidateSlug = baseSlug;
  let counter = 1;

  while (await repository.slugExists(candidateSlug)) {
    counter += 1;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
};
