import { readFileSync } from 'fs';
import { gql } from 'apollo-server';
import { GraphQLDate } from 'graphql-iso-date';
import { ObjectId, PartnerModel, ScheduleModel } from './db/models';
import {
  createPartnerRequest, deletePartnerRequest, getPartner, getPartnerRequests, getPartners,
} from './db/partners';
import {
  completeDay, getOrCreateSchedule, getScheduleDays, setSkippedDayStatus,
} from './db/schedule';
import {
  DeletePartnerRequestPayload,
  MutationCompleteDayArgs, MutationCreatePartnerRequestArgs, MutationDeletePartnerRequestArgs, MutationSkipDayArgs,
  QueryScheduleArgs, Resolvers, ResolversTypes,
} from './generated/graphql';

// Construct the GraphQL schema
const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));

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
    async partners(): Promise<PartnerModel[]> {
      return getPartners();
    },

    async schedule(_: unknown, { month }: QueryScheduleArgs): Promise<ScheduleModel> {
      return getOrCreateSchedule(month);
    },
  },
};

export { typeDefs, resolvers };
