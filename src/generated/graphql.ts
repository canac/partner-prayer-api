import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: Date;
};










export type PartnerRequest = {
  __typename?: 'PartnerRequest';
  _id: Scalars['ID'];
  partner: Partner;
  createdAt: Scalars['Date'];
  request: Scalars['String'];
};

export type Partner = {
  __typename?: 'Partner';
  _id: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  requests: Array<PartnerRequest>;
};

export type ScheduleDay = {
  __typename?: 'ScheduleDay';
  _id: Scalars['ID'];
  schedule: Schedule;
  dayId: Scalars['Int'];
  partners: Array<Partner>;
  isSkipped: Scalars['Boolean'];
};

export type Schedule = {
  __typename?: 'Schedule';
  _id: Scalars['ID'];
  month: Scalars['Date'];
  completedDays: Scalars['Int'];
  days: Array<ScheduleDay>;
};

export type Query = {
  __typename?: 'Query';
  partners: Array<Partner>;
  schedule: Schedule;
};


export type QueryScheduleArgs = {
  month: Scalars['Date'];
};

export type CreatePartnerRequestInput = {
  partnerId: Scalars['String'];
  request: Scalars['String'];
};

export type DeletePartnerRequestInput = {
  partnerRequestId: Scalars['String'];
};

export type DeletePartnerRequestPayload = {
  __typename?: 'DeletePartnerRequestPayload';
  partnerRequestId: Scalars['String'];
};

export type CompleteDayInput = {
  scheduleId: Scalars['String'];
  completedDays: Scalars['Int'];
};

export type SkipDayInput = {
  scheduleId: Scalars['String'];
  dayId: Scalars['Int'];
  isSkipped: Scalars['Boolean'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createPartnerRequest: PartnerRequest;
  deletePartnerRequest: DeletePartnerRequestPayload;
  completeDay: Schedule;
  skipDay: Schedule;
};


export type MutationCreatePartnerRequestArgs = {
  input: CreatePartnerRequestInput;
};


export type MutationDeletePartnerRequestArgs = {
  input: DeletePartnerRequestInput;
};


export type MutationCompleteDayArgs = {
  input: CompleteDayInput;
};


export type MutationSkipDayArgs = {
  input: SkipDayInput;
};

export type AdditionalEntityFields = {
  path?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

import { ObjectID } from 'mongodb';
export type PartnerRequestModel = {
  _id: ObjectID,
  partnerId: PartnerModel['_id'],
  createdAt: Date,
  request: string,
};

export type PartnerModel = {
  _id: ObjectID,
  firstName: string,
  lastName: string,
};

export type ScheduleDayModel = {
  _id: ObjectID,
  scheduleId: ScheduleModel['_id'],
  dayId: number,
  partners: Array<PartnerModel['_id']>,
  isSkipped: boolean,
};

export type ScheduleModel = {
  _id: ObjectID,
  month: Date,
  completedDays: number,
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Date: ResolverTypeWrapper<Scalars['Date']>;
  PartnerRequest: ResolverTypeWrapper<Omit<PartnerRequest, 'partner'> & { partner: ResolversTypes['Partner'] }>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Partner: ResolverTypeWrapper<PartnerModel>;
  ScheduleDay: ResolverTypeWrapper<Omit<ScheduleDay, 'schedule' | 'partners'> & { schedule: ResolversTypes['Schedule'], partners: Array<ResolversTypes['Partner']> }>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Schedule: ResolverTypeWrapper<ScheduleModel>;
  Query: ResolverTypeWrapper<{}>;
  CreatePartnerRequestInput: CreatePartnerRequestInput;
  DeletePartnerRequestInput: DeletePartnerRequestInput;
  DeletePartnerRequestPayload: ResolverTypeWrapper<DeletePartnerRequestPayload>;
  CompleteDayInput: CompleteDayInput;
  SkipDayInput: SkipDayInput;
  Mutation: ResolverTypeWrapper<{}>;
  AdditionalEntityFields: AdditionalEntityFields;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Date: Scalars['Date'];
  PartnerRequest: Omit<PartnerRequest, 'partner'> & { partner: ResolversParentTypes['Partner'] };
  ID: Scalars['ID'];
  String: Scalars['String'];
  Partner: PartnerModel;
  ScheduleDay: Omit<ScheduleDay, 'schedule' | 'partners'> & { schedule: ResolversParentTypes['Schedule'], partners: Array<ResolversParentTypes['Partner']> };
  Int: Scalars['Int'];
  Boolean: Scalars['Boolean'];
  Schedule: ScheduleModel;
  Query: {};
  CreatePartnerRequestInput: CreatePartnerRequestInput;
  DeletePartnerRequestInput: DeletePartnerRequestInput;
  DeletePartnerRequestPayload: DeletePartnerRequestPayload;
  CompleteDayInput: CompleteDayInput;
  SkipDayInput: SkipDayInput;
  Mutation: {};
  AdditionalEntityFields: AdditionalEntityFields;
}>;

export type UnionDirectiveArgs = {   discriminatorField?: Maybe<Scalars['String']>;
  additionalFields?: Maybe<Array<Maybe<AdditionalEntityFields>>>; };

export type UnionDirectiveResolver<Result, Parent, ContextType = any, Args = UnionDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AbstractEntityDirectiveArgs = {   discriminatorField: Scalars['String'];
  additionalFields?: Maybe<Array<Maybe<AdditionalEntityFields>>>; };

export type AbstractEntityDirectiveResolver<Result, Parent, ContextType = any, Args = AbstractEntityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type EntityDirectiveArgs = {   embedded?: Maybe<Scalars['Boolean']>;
  additionalFields?: Maybe<Array<Maybe<AdditionalEntityFields>>>; };

export type EntityDirectiveResolver<Result, Parent, ContextType = any, Args = EntityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ColumnDirectiveArgs = {   overrideType?: Maybe<Scalars['String']>; };

export type ColumnDirectiveResolver<Result, Parent, ContextType = any, Args = ColumnDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type IdDirectiveArgs = {  };

export type IdDirectiveResolver<Result, Parent, ContextType = any, Args = IdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type LinkDirectiveArgs = {   overrideType?: Maybe<Scalars['String']>; };

export type LinkDirectiveResolver<Result, Parent, ContextType = any, Args = LinkDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type EmbeddedDirectiveArgs = {  };

export type EmbeddedDirectiveResolver<Result, Parent, ContextType = any, Args = EmbeddedDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type MapDirectiveArgs = {   path: Scalars['String']; };

export type MapDirectiveResolver<Result, Parent, ContextType = any, Args = MapDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type PartnerRequestResolvers<ContextType = any, ParentType extends ResolversParentTypes['PartnerRequest'] = ResolversParentTypes['PartnerRequest']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  partner?: Resolver<ResolversTypes['Partner'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  request?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PartnerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Partner'] = ResolversParentTypes['Partner']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requests?: Resolver<Array<ResolversTypes['PartnerRequest']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ScheduleDayResolvers<ContextType = any, ParentType extends ResolversParentTypes['ScheduleDay'] = ResolversParentTypes['ScheduleDay']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  schedule?: Resolver<ResolversTypes['Schedule'], ParentType, ContextType>;
  dayId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  partners?: Resolver<Array<ResolversTypes['Partner']>, ParentType, ContextType>;
  isSkipped?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ScheduleResolvers<ContextType = any, ParentType extends ResolversParentTypes['Schedule'] = ResolversParentTypes['Schedule']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  month?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  completedDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  days?: Resolver<Array<ResolversTypes['ScheduleDay']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  partners?: Resolver<Array<ResolversTypes['Partner']>, ParentType, ContextType>;
  schedule?: Resolver<ResolversTypes['Schedule'], ParentType, ContextType, RequireFields<QueryScheduleArgs, 'month'>>;
}>;

export type DeletePartnerRequestPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeletePartnerRequestPayload'] = ResolversParentTypes['DeletePartnerRequestPayload']> = ResolversObject<{
  partnerRequestId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createPartnerRequest?: Resolver<ResolversTypes['PartnerRequest'], ParentType, ContextType, RequireFields<MutationCreatePartnerRequestArgs, 'input'>>;
  deletePartnerRequest?: Resolver<ResolversTypes['DeletePartnerRequestPayload'], ParentType, ContextType, RequireFields<MutationDeletePartnerRequestArgs, 'input'>>;
  completeDay?: Resolver<ResolversTypes['Schedule'], ParentType, ContextType, RequireFields<MutationCompleteDayArgs, 'input'>>;
  skipDay?: Resolver<ResolversTypes['Schedule'], ParentType, ContextType, RequireFields<MutationSkipDayArgs, 'input'>>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Date?: GraphQLScalarType;
  PartnerRequest?: PartnerRequestResolvers<ContextType>;
  Partner?: PartnerResolvers<ContextType>;
  ScheduleDay?: ScheduleDayResolvers<ContextType>;
  Schedule?: ScheduleResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  DeletePartnerRequestPayload?: DeletePartnerRequestPayloadResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = any> = ResolversObject<{
  union?: UnionDirectiveResolver<any, any, ContextType>;
  abstractEntity?: AbstractEntityDirectiveResolver<any, any, ContextType>;
  entity?: EntityDirectiveResolver<any, any, ContextType>;
  column?: ColumnDirectiveResolver<any, any, ContextType>;
  id?: IdDirectiveResolver<any, any, ContextType>;
  link?: LinkDirectiveResolver<any, any, ContextType>;
  embedded?: EmbeddedDirectiveResolver<any, any, ContextType>;
  map?: MapDirectiveResolver<any, any, ContextType>;
}>;


/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = any> = DirectiveResolvers<ContextType>;