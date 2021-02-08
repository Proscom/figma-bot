import axios from 'axios';
import { RequestProcessedHandler } from './FigmaBotServer';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

export interface ISaveURLToAirtableData {
  itemId: string;
  baseURL: string;
}
export const saveURLToAirtable: RequestProcessedHandler<ISaveURLToAirtableData> = async (
  req,
  res,
  data
) => {
  const baseId = req.query.airtableBaseId;
  const tableName = req.query.airtableTableName;
  const recordId = req.query.airtableRecordId;
  const filedName = req.query.airtableFieldName;
  const fileId = data.itemId;
  if (!AIRTABLE_API_KEY) {
    req.log.info(
      `Url to file with id "${fileId}" not saved to Airtable: Environment variable "AIRTABLE_API_KEY" not found.`
    );
  } else if (!baseId || typeof baseId !== 'string') {
    req.log.info(
      `Url to file with id "${fileId}" not saved to Airtable: Parameter "baseId" must be a non-empty string.`
    );
  } else if (!tableName || typeof tableName !== 'string') {
    req.log.info(
      `Url to file with id "${fileId}" not saved to Airtable: Parameter "tableName" must be a non-empty string.`
    );
  } else if (!recordId || typeof recordId !== 'string') {
    req.log.info(
      `Url to file with id "${fileId}" not saved to Airtable: Parameter "recordId" must be a non-empty string.`
    );
  } else if (!filedName || typeof filedName !== 'string') {
    req.log.info(
      `Url to file with id "${fileId}" not saved to Airtable: Parameter "fieldName" must be a non-empty string.`
    );
  } else {
    const url = `${data.baseURL}/${data.itemId}`;
    await axios.patch(
      `https://api.airtable.com/v0/${baseId}/${tableName}`,
      {
        records: [
          {
            id: recordId,
            fields: { [filedName]: url }
          }
        ]
      },
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
