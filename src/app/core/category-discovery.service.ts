import { Injectable } from '@angular/core';

import { ToolCategoryRecord, ToolRecord } from './models';

interface CategoryCandidate {
  id: string;
  name: string;
  keywords: string[];
}

const CATEGORY_CANDIDATES: CategoryCandidate[] = [
  {
    id: 'fasteners-hardware',
    name: 'Fasteners and hardware',
    keywords: ['anchor', 'bolt', 'bracket', 'chain', 'fixing', 'hinge', 'hook', 'nail', 'nut', 'padlock', 'screw', 'washer'],
  },
  {
    id: 'adhesives-sealants',
    name: 'Adhesives and sealants',
    keywords: ['adhesive', 'caulk', 'epoxy', 'filler', 'glue', 'sealant', 'silicone'],
  },
  {
    id: 'flooring-tiling',
    name: 'Flooring and tiling',
    keywords: ['floor', 'grout', 'laminate', 'spacer', 'tile', 'tiling'],
  },
  {
    id: 'masonry',
    name: 'Masonry',
    keywords: ['brick', 'cement', 'concrete', 'masonry', 'mortar', 'pointing', 'trowel'],
  },
  {
    id: 'woodworking',
    name: 'Woodworking',
    keywords: ['chisel', 'clamp', 'dowel', 'jig', 'plane', 'woodworking', 'workbench'],
  },
  {
    id: 'metalworking',
    name: 'Metalworking',
    keywords: ['anvil', 'metal', 'metalwork', 'solder', 'soldering', 'welder', 'welding'],
  },
  {
    id: 'moving-lifting',
    name: 'Moving and lifting',
    keywords: ['dolly', 'hoist', 'lifting', 'moving', 'strap', 'trolley'],
  },
  {
    id: 'kitchen-catering',
    name: 'Kitchen and catering',
    keywords: ['catering', 'cooler', 'grill', 'kitchen', 'urn'],
  },
  {
    id: 'party-events',
    name: 'Party and events',
    keywords: ['event', 'gazebo', 'party', 'speaker', 'table'],
  },
];

@Injectable({ providedIn: 'root' })
export class CategoryDiscoveryService {
  discoverCategories(tools: ToolRecord[], categories: ToolCategoryRecord[]): ToolCategoryRecord[] {
    const existingCategoryIds = new Set(categories.map((category) => category.id));
    const existingCategoryNames = new Set(categories.map((category) => category.name.trim().toLowerCase()));
    const maxOrder = categories.reduce((highestOrder, category) => Math.max(highestOrder, category.order), 0);
    const activeTools = tools.filter((tool) => !tool.deleted && tool.name.trim());

    return CATEGORY_CANDIDATES
      .filter(
        (candidate) =>
          !existingCategoryIds.has(candidate.id) &&
          !existingCategoryNames.has(candidate.name.toLowerCase()) &&
          this.isValidCandidate(candidate, activeTools),
      )
      .map((candidate, index) => ({
        id: candidate.id,
        name: candidate.name,
        order: maxOrder + (index + 1) * 10,
      }));
  }

  private isValidCandidate(candidate: CategoryCandidate, tools: ToolRecord[]): boolean {
    let otherMatches = 0;
    let totalMatches = 0;

    for (const tool of tools) {
      if (!this.matchesCandidate(tool.name, candidate)) {
        continue;
      }

      totalMatches += 1;
      if (tool.categoryId === 'other' || tool.categoryName.trim().toLowerCase() === 'other') {
        otherMatches += 1;
      }
    }

    return otherMatches > 0 || totalMatches >= 2;
  }

  private matchesCandidate(toolName: string, candidate: CategoryCandidate): boolean {
    const normalizedToolName = toolName.toLowerCase();
    return candidate.keywords.some((keyword) => new RegExp(`\\b${this.escapeRegExp(keyword)}s?\\b`, 'u').test(normalizedToolName));
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
