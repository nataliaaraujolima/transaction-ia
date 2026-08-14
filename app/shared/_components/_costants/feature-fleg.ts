interface IFeatureFlag {
  id: number;
  name: string;
  enabled: boolean;
}

export const featureFlags: IFeatureFlag[] = [
  {
    id: 1,
    name: "Pluggy",
    enabled: true,
  },
];

export const getFeatureFlag = (id: number) => {
  return featureFlags.find((featureFlag) => featureFlag.id === id);
};
