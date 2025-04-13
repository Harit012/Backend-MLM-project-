export const updateFields = (obj: Record<string, any>) => {
    const update: { $set: Record<string, any> } = { $set: {} };
  
    for (const key in obj) {
      const value = obj[key];
      if (value !== undefined && value !== null && value !== "") {
        update.$set[key] = value;
      }
    }
  
    return update;
  };
  