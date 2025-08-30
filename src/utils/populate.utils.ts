import { Types } from "mongoose";

export interface PopulateConfig {
  field: string;
  localIdsField: string;
  service: {
    get: (ids: number[]) => Promise<{ data: any[] }>;
  };
  mapKey?: string;
}

// items = main data , configs = data to populate
// Get Unique Ids for each config
export const populateRelatedData = async (
  items: any[],
  configs: PopulateConfig[],
): Promise<any[]> => {
  const idPromises = configs.map(async (config) => {
    const allIds = items.flatMap((item) => item[config.localIdsField] || []);
    const uniqueIds = [...new Set(allIds)];
    return { config, ids: uniqueIds };
  });

  const configUniqueIds = await Promise.all(idPromises);

  const fetchPromises = configUniqueIds.map(async ({ config, ids }) => {
    if (ids.length === 0) return { config, data: [] };

    const result = await config.service.get(ids);
    return { config, data: result.data };
  });

  const fetchedData = await Promise.all(fetchPromises);

  const dataMaps = new Map();
  fetchedData.forEach(({ config, data }) => {
    const mapKey = config.mapKey || "bgg_id";
    const map = new Map();
    data.forEach((item) => {
      map.set(item[mapKey], item);
    });
    dataMaps.set(config.localIdsField, { map, field: config.field });
  });
  console.log(dataMaps);
  return items.map((item) => {
    const populatedItem = { ...item };

    dataMaps.forEach(({ map, field }, localIdsField) => {
      const relatedItems = item[localIdsField || []]
        .map((id: number | string | Types.ObjectId) => map.get(id))
        .filter(Boolean);

      populatedItem[field] = relatedItems;
      delete populatedItem[localIdsField];
    });

    return populatedItem;
  });
};
