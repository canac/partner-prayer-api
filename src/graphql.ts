import { readFileSync } from 'fs';
import { resolve } from 'path';
import { gql } from 'apollo-server-lambda';
import { GraphQLDate } from 'graphql-iso-date';
import { ObjectId } from 'mongodb';
import {
  createPartnerRequest, deletePartnerRequest, getPartner, getPartnerRequests, getPartners,
} from './db/partners';
import {
  completeDay, getOrCreateSchedule, getScheduleDays, setSkippedDayStatus,
} from './db/schedule';
import {
  DeletePartnerRequestPayload,
  MutationCompleteDayArgs, MutationCreatePartnerRequestArgs, MutationDeletePartnerRequestArgs, MutationSkipDayArgs,
  PartnerModel, QueryPartnerArgs, QueryScheduleArgs,
  Resolvers, ResolversTypes, ScheduleModel,
} from './generated/graphql';

// Construct the GraphQL schema
console.log(process.env);
console.log(process.cwd());
console.log(resolve(__dirname, '../../schema.graphql'));
const typeDefs = gql(readFileSync(resolve(__dirname, '../../schema.graphql'), 'utf8'));

// Provide resolver functions for the schema fields
const resolvers: Resolvers = {
  Date: GraphQLDate,
  Mutation: {
    async createPartnerRequest(_: unknown, { input: { partnerId, request } }: MutationCreatePartnerRequestArgs):
      Promise<ResolversTypes['PartnerRequest']> {
      if (request.length === 0) {
        throw new Error('Request is empty');
      }

      const partner = await getPartner(new ObjectId(partnerId));
      if (!partner) {
        throw new Error('Partner does not exist');
      }

      const partnerRequest = await createPartnerRequest(new ObjectId(partnerId), request);
      return {
        ...partnerRequest,
        _id: partnerRequest._id.toHexString(),
        partner,
      };
    },

    async deletePartnerRequest(_: unknown, { input: { partnerRequestId } }: MutationDeletePartnerRequestArgs):
      Promise<DeletePartnerRequestPayload> {
      await deletePartnerRequest(new ObjectId(partnerRequestId));
      return { partnerRequestId };
    },

    completeDay(_: unknown, { input: { scheduleId, completedDays } }: MutationCompleteDayArgs): Promise<ScheduleModel> {
      return completeDay(new ObjectId(scheduleId), completedDays);
    },

    skipDay(_: unknown, { input: { scheduleId, dayId, isSkipped } }: MutationSkipDayArgs): Promise<ScheduleModel> {
      return setSkippedDayStatus(new ObjectId(scheduleId), dayId, isSkipped);
    },
  },
  Partner: {
    fullName(partner: PartnerModel): string {
      return `${partner.firstName} ${partner.lastName}`;
    },

    async requests(partner: PartnerModel): Promise<ResolversTypes['PartnerRequest'][]> {
      const partnerRequests = await getPartnerRequests(partner._id);
      return partnerRequests.map((partnerRequest) => ({
        ...partnerRequest,
        _id: partnerRequest._id.toHexString(),
        partner,
      }));
    },
  },
  Schedule: {
    async days(schedule: ScheduleModel): Promise<ResolversTypes['ScheduleDay'][]> {
      const allPartners = await getPartners();

      // Index the partners by their id
      const partnersById = new Map<string, PartnerModel>(allPartners
        .map((partner) => ([partner._id.toHexString(), partner])));

      const days = await getScheduleDays(schedule._id);
      return days.map((day) => ({
        ...day,

        _id: day._id.toHexString(),
        schedule,

        // Convert the partner ids to full partner models
        partners: day.partners.map((id) => partnersById.get(id.toHexString()) || []).flat(),
      }));
    },
  },
  Query: {
    async partner(_: unknown, { id }: QueryPartnerArgs): Promise<PartnerModel | null> {
      return getPartner(new ObjectId(id));
    },

    async partners(): Promise<PartnerModel[]> {
      return getPartners();
    },

    async schedule(_: unknown, { month }: QueryScheduleArgs): Promise<ScheduleModel> {
      return getOrCreateSchedule(month);
    },
  },
};

export { typeDefs, resolvers };
