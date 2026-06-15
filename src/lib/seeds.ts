import type { SeedModel } from "./seedTypes";
import { G823_SEED } from "./g823Seed";

/** Các seed PFMEA dựng sẵn từ tài liệu thực tế, tra theo tên model base. */
export const SEEDS: SeedModel[] = [G823_SEED];

/** Tìm seed khớp tên model base (không phân biệt hoa thường). */
export function findSeed(modelBaseName: string | undefined): SeedModel | undefined {
  if (!modelBaseName) return undefined;
  const n = modelBaseName.trim().toLowerCase();
  return SEEDS.find((s) => s.key.toLowerCase() === n);
}
