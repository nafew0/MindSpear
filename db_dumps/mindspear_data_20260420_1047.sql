--
-- PostgreSQL database dump
--

\restrict ib2N6qhuy4lRnhefP8xX5b9QrfwFJaMTXX6mAKJTDkY32IDd0a7sxxVk6MOKVmQ

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.users DISABLE TRIGGER ALL;

INSERT INTO public.users (id, first_name, last_name, email, phone, email_verified_at, email_verification_token, is_verified, profile_picture, account_type, institution_id, institution_name, designation, department, password, provider, provider_id, remember_token, created_at, updated_at) VALUES (1, 'Admin', 'User', 'admin@admin.com', '1111111111', '2026-04-16 06:33:49', NULL, true, NULL, 'admin', NULL, 'Admin Institution', 'System Admin', 'IT', '$2y$12$HzNAeNTIwIksE1RSwNEPmuBjq.oxlCvArCeglmpEbhE4vqQwoB0wa', NULL, NULL, 'EY1gjwMqcz', '2026-04-16 06:33:49', '2026-04-16 06:33:49');
INSERT INTO public.users (id, first_name, last_name, email, phone, email_verified_at, email_verification_token, is_verified, profile_picture, account_type, institution_id, institution_name, designation, department, password, provider, provider_id, remember_token, created_at, updated_at) VALUES (2, 'Instructor', 'One', 'instructor@instructor.com', '2222222222', '2026-04-16 06:33:49', NULL, true, NULL, 'instructor', NULL, 'Instructor Institute', 'Lecturer', 'Education', '$2y$12$LTGudYhloUAxcWnK0076CO4OxI2VUAS/4MDWmVjmup7YTkZs/W8qG', NULL, NULL, 'rFRNV3tkXf', '2026-04-16 06:33:49', '2026-04-16 06:33:49');
INSERT INTO public.users (id, first_name, last_name, email, phone, email_verified_at, email_verification_token, is_verified, profile_picture, account_type, institution_id, institution_name, designation, department, password, provider, provider_id, remember_token, created_at, updated_at) VALUES (3, 'Participant', 'User', 'participant@participant.com', '3333333333', '2026-04-16 06:33:49', NULL, true, NULL, 'participant', NULL, 'Participant College', 'Student', 'Science', '$2y$12$IjlmWvP87DVpgc4GNN7ehupAFxuPqwR2FbDgi6qbxHNqoGvvRG01m', NULL, NULL, 'jlU4JtAIpa', '2026-04-16 06:33:49', '2026-04-16 06:33:49');
INSERT INTO public.users (id, first_name, last_name, email, phone, email_verified_at, email_verification_token, is_verified, profile_picture, account_type, institution_id, institution_name, designation, department, password, provider, provider_id, remember_token, created_at, updated_at) VALUES (4, 'Super', 'Admin', 'admin@mindspear.app', NULL, '2026-04-16 06:33:50', NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, '$2y$12$30f95SrOpxAlBhxoulTbHu1bZBPtZ1zY1RCyMCT19k9lhS6yFUVYW', NULL, NULL, NULL, '2026-04-16 06:33:50', '2026-04-16 06:33:50');
INSERT INTO public.users (id, first_name, last_name, email, phone, email_verified_at, email_verification_token, is_verified, profile_picture, account_type, institution_id, institution_name, designation, department, password, provider, provider_id, remember_token, created_at, updated_at) VALUES (5, 'Abu Naser Md.', 'Nafew', 'nafew@bdren.net.bd', NULL, '2026-04-16 06:37:53', '3hKnMwLlkLXBNP2r202NMTIlp4zkOcHT8Vaj3ASUVb8FTyFAgFZAPCta969U', true, NULL, NULL, NULL, NULL, NULL, NULL, '$2y$12$MzB9K8ljI9UMVmQ5CKn5d.XlcyyjevxfzdKtlk3wxTWsu6W/5wxFO', NULL, NULL, NULL, '2026-04-16 06:35:52', '2026-04-16 06:39:25');


ALTER TABLE public.users ENABLE TRIGGER ALL;

--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.files DISABLE TRIGGER ALL;

INSERT INTO public.files (id, name, path, type, size, mime_type, extension, original_name, user_id, is_active, is_deleted, deleted_at, restored_at, created_by, updated_by, deleted_by, restored_by, created_at, updated_at) VALUES (1, 'GPT-5-logo-1030x588.jpg', 'storage/2026/04/16/uploads/GpUbknf4myQIdUISuLTFgfI9MjzEgEfueOBr69Mn.jpg', 'image', '58205', 'image/jpeg', 'jpg', 'GPT-5-logo-1030x588.jpg', 5, true, false, NULL, NULL, '5', NULL, NULL, NULL, '2026-04-16 06:40:57', '2026-04-16 06:40:57');


ALTER TABLE public.files ENABLE TRIGGER ALL;

--
-- Data for Name: institutions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.institutions DISABLE TRIGGER ALL;



ALTER TABLE public.institutions ENABLE TRIGGER ALL;

--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.permissions DISABLE TRIGGER ALL;



ALTER TABLE public.permissions ENABLE TRIGGER ALL;

--
-- Data for Name: model_has_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.model_has_permissions DISABLE TRIGGER ALL;



ALTER TABLE public.model_has_permissions ENABLE TRIGGER ALL;

--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.roles DISABLE TRIGGER ALL;

INSERT INTO public.roles (id, name, guard_name, created_at, updated_at) VALUES (1, 'Super Admin', 'web', '2026-04-16 06:33:50', '2026-04-16 06:33:50');


ALTER TABLE public.roles ENABLE TRIGGER ALL;

--
-- Data for Name: model_has_roles; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.model_has_roles DISABLE TRIGGER ALL;

INSERT INTO public.model_has_roles (role_id, model_type, model_id) VALUES (1, 'App\Models\User', 4);


ALTER TABLE public.model_has_roles ENABLE TRIGGER ALL;

--
-- Data for Name: preferences; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.preferences DISABLE TRIGGER ALL;

INSERT INTO public.preferences (id, category, field, value, created_at, updated_at) VALUES (1, 'site', 'title', '"What will you ask your audience?"', '2026-04-16 06:33:50', '2026-04-16 06:33:50');
INSERT INTO public.preferences (id, category, field, value, created_at, updated_at) VALUES (2, 'site', 'message', '"Turn presentations into conversations with interactive polls that engage meetings and classrooms."', '2026-04-16 06:33:50', '2026-04-16 06:33:50');
INSERT INTO public.preferences (id, category, field, value, created_at, updated_at) VALUES (3, 'site', 'logo', '"images\/logo\/logo.svg"', '2026-04-16 06:33:50', '2026-04-16 06:33:50');
INSERT INTO public.preferences (id, category, field, value, created_at, updated_at) VALUES (4, 'site', 'tagline', '"Learn through questions. Teach through conversation."', '2026-04-16 06:33:50', '2026-04-16 06:33:50');
INSERT INTO public.preferences (id, category, field, value, created_at, updated_at) VALUES (5, 'site', 'favicon', '"images\/favicon\/favicon.ico"', '2026-04-16 06:33:50', '2026-04-16 06:33:50');
INSERT INTO public.preferences (id, category, field, value, created_at, updated_at) VALUES (6, 'site', 'logo_dark', '"images\/logo\/logo-dark.svg"', '2026-04-16 06:33:50', '2026-04-16 06:33:50');
INSERT INTO public.preferences (id, category, field, value, created_at, updated_at) VALUES (7, 'site', 'logo_light', '"images\/logo\/logo-light.svg"', '2026-04-16 06:33:50', '2026-04-16 06:33:50');


ALTER TABLE public.preferences ENABLE TRIGGER ALL;

--
-- Data for Name: quest_task_bank_categories; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quest_task_bank_categories DISABLE TRIGGER ALL;

INSERT INTO public.quest_task_bank_categories (id, name, description, is_parent, parent_category_id, created_by, created_at, updated_at) VALUES (1, 'My Task Bank', NULL, true, NULL, 5, '2026-04-17 18:33:05', '2026-04-17 18:33:05');


ALTER TABLE public.quest_task_bank_categories ENABLE TRIGGER ALL;

--
-- Data for Name: quest_bank_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quest_bank_tasks DISABLE TRIGGER ALL;



ALTER TABLE public.quest_bank_tasks ENABLE TRIGGER ALL;

--
-- Data for Name: quests; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quests DISABLE TRIGGER ALL;

INSERT INTO public.quests (id, title, description, creator_id, is_published, start_datetime, end_datetime, timezone, visibility, join_link, join_code, sequential_progression, created_at, updated_at, deleted_at, status, origin_owner_id, origin_owner_name, origin_owner_profile_picture) VALUES (86, 'Untitled Quest', NULL, 5, false, '2026-04-17 18:33:03', '2031-04-18 18:33:03', 'UTC', 'public', 'oea-sjo-v9v-ylf', '902559', true, '2026-04-17 18:33:05', '2026-04-17 18:33:05', NULL, 'Not Started', NULL, NULL, NULL);
INSERT INTO public.quests (id, title, description, creator_id, is_published, start_datetime, end_datetime, timezone, visibility, join_link, join_code, sequential_progression, created_at, updated_at, deleted_at, status, origin_owner_id, origin_owner_name, origin_owner_profile_picture) VALUES (87, 'My Quest Test', NULL, 5, true, '2026-04-17 18:36:48', '2031-04-18 00:40:17', 'UTC', 'public', 'jeq-gmu-hbn-2g1', '098398', true, '2026-04-17 18:36:48', '2026-04-18 06:52:42', NULL, 'Ended', NULL, NULL, NULL);
INSERT INTO public.quests (id, title, description, creator_id, is_published, start_datetime, end_datetime, timezone, visibility, join_link, join_code, sequential_progression, created_at, updated_at, deleted_at, status, origin_owner_id, origin_owner_name, origin_owner_profile_picture) VALUES (130, 'Untitled Quest', NULL, 5, false, '2026-04-19 03:33:05', '2031-04-20 03:33:05', 'UTC', 'public', 'mrc-jfm-utg-smi', '202207', true, '2026-04-19 03:33:06', '2026-04-19 03:33:06', NULL, 'Not Started', NULL, NULL, NULL);
INSERT INTO public.quests (id, title, description, creator_id, is_published, start_datetime, end_datetime, timezone, visibility, join_link, join_code, sequential_progression, created_at, updated_at, deleted_at, status, origin_owner_id, origin_owner_name, origin_owner_profile_picture) VALUES (131, 'Untitled Quest', NULL, 5, false, '2026-04-19 03:33:06', '2031-04-20 03:33:06', 'UTC', 'public', 't7d-fwo-eee-9qo', '861368', true, '2026-04-19 03:33:07', '2026-04-19 03:33:07', NULL, 'Not Started', NULL, NULL, NULL);
INSERT INTO public.quests (id, title, description, creator_id, is_published, start_datetime, end_datetime, timezone, visibility, join_link, join_code, sequential_progression, created_at, updated_at, deleted_at, status, origin_owner_id, origin_owner_name, origin_owner_profile_picture) VALUES (132, 'Untitled Quest', NULL, 5, false, '2026-04-19 03:33:11', '2031-04-20 03:33:11', 'UTC', 'public', '395-ptd-xmg-2g9', '118617', true, '2026-04-19 03:33:11', '2026-04-19 03:33:11', NULL, 'Not Started', NULL, NULL, NULL);
INSERT INTO public.quests (id, title, description, creator_id, is_published, start_datetime, end_datetime, timezone, visibility, join_link, join_code, sequential_progression, created_at, updated_at, deleted_at, status, origin_owner_id, origin_owner_name, origin_owner_profile_picture) VALUES (133, 'All Question Test', NULL, 5, true, '2026-04-19 03:33:56', '2031-04-19 11:34:29', 'UTC', 'public', 'le9-muj-hjt-od8', '632501', true, '2026-04-19 03:33:57', '2026-04-19 09:54:47', NULL, 'Ended', NULL, NULL, NULL);


ALTER TABLE public.quests ENABLE TRIGGER ALL;

--
-- Data for Name: quest_origins; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quest_origins DISABLE TRIGGER ALL;



ALTER TABLE public.quest_origins ENABLE TRIGGER ALL;

--
-- Data for Name: quest_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quest_tasks DISABLE TRIGGER ALL;

INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (46, 86, 'Untitled question', NULL, 'qsenchoice', 1, NULL, true, '2026-04-17 18:33:05', '2026-04-17 18:33:05', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (48, 87, 'Untitled question', NULL, 'qsenchoice', 2, NULL, true, '2026-04-17 18:36:57', '2026-04-17 18:38:27', '2026-04-17 18:38:27', 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (47, 87, 'What is the best food for you?', NULL, 'single_choice', 1, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "Beef", "color": "#F79945"}, {"id": 2, "text": "Biriyani", "color": "#BC5EB3"}, {"id": 3, "text": "Cake", "color": "#5769e7"}, {"id": 4, "text": "Drinks", "color": "#89c6c7"}], "time_limit": 30}', true, '2026-04-17 18:39:42', '2026-04-17 18:39:42', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (49, 87, 'What''s your job?', NULL, 'wordcloud', 2, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "Option 1", "color": "#F79945"}], "time_limit": 30}', true, '2026-04-17 18:39:42', '2026-04-17 18:39:42', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (50, 87, 'Do you like BdREN?', NULL, 'truefalse', 3, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "Yes", "color": "#F79945"}, {"id": 2, "text": "No", "color": "#bc5eb3"}], "time_limit": 30}', true, '2026-04-17 18:39:42', '2026-04-17 18:39:42', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (51, 87, 'Rank these items', NULL, 'ranking', 4, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "kvnewvhb", "color": "#F79945"}, {"id": 2, "text": "sdvfvev", "color": "#BC5EB3"}, {"id": 3, "text": "vfdesrve", "color": "#5769e7"}, {"id": 4, "text": "gbrder", "color": "#89c6c7"}, {"id": 5, "text": "934ef", "color": "#0aa3a3"}], "time_limit": 30}', true, '2026-04-17 18:39:42', '2026-04-17 18:39:42', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (79, 130, 'Untitled question', NULL, 'qsenchoice', 1, NULL, true, '2026-04-19 03:33:07', '2026-04-19 03:33:07', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (80, 131, 'Untitled question', NULL, 'qsenchoice', 1, NULL, true, '2026-04-19 03:33:08', '2026-04-19 03:33:08', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (81, 132, 'Untitled question', NULL, 'qsenchoice', 1, NULL, true, '2026-04-19 03:33:12', '2026-04-19 03:33:12', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (82, 133, 'Untitled question', NULL, 'qsenchoice', 1, NULL, true, '2026-04-19 03:33:58', '2026-04-19 03:34:13', '2026-04-19 03:34:13', 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (88, 133, 'What''s your name?', NULL, 'shortanswer', 1, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "Item 1", "color": "#F79945"}], "time_limit": 30}', true, '2026-04-19 05:34:35', '2026-04-19 05:34:35', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (84, 133, 'Do you think AI may replace your job?', NULL, 'truefalse', 3, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "Yes", "color": "#F79945"}, {"id": 2, "text": "No", "color": "#bc5eb3"}], "time_limit": 30}', true, '2026-04-19 05:34:35', '2026-04-19 05:34:35', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (83, 133, 'What is your best choice?', NULL, 'single_choice', 2, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "Food", "color": "#F79945"}, {"id": 2, "text": "Money", "color": "#BC5EB3"}, {"id": 3, "text": "Health", "color": "#5769e7"}, {"id": 4, "text": "Fun", "color": "#89c6c7"}, {"id": 5, "text": "Religion", "color": "#0aa3a3"}], "time_limit": 30}', true, '2026-04-19 05:34:35', '2026-04-19 05:34:35', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (85, 133, 'What comes to your mind when you hear the word AI?', NULL, 'wordcloud', 4, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "Artificial Intelligence", "color": "#F79945"}, {"id": 2, "text": "Overrated"}, {"id": 3, "text": "Overhyped", "color": "#0aa3a3"}, {"id": 4, "text": "Machine Learning"}], "time_limit": 30}', true, '2026-04-19 05:34:35', '2026-04-19 05:34:35', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (86, 133, 'On a scale of one to ten, what are your strengths in these areas?', NULL, 'scales', 5, '{"maxText": "Very Strong", "minText": "Very weak", "layout_id": null, "maxNumber": 10, "minNumber": 1, "questions": [{"id": 1, "text": "Technical", "color": "#F79945"}, {"id": 2, "text": "Accounting", "color": "#BC5EB3"}, {"id": 3, "text": "Finance", "color": "#5769e7"}, {"id": 4, "text": "Human Resource", "color": "#89c6c7"}, {"id": 5, "text": "Management", "color": "#0aa3a3"}], "time_limit": 30}', true, '2026-04-19 05:34:35', '2026-04-19 05:34:35', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (87, 133, 'Rank these items based on your choice.', NULL, 'ranking', 6, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "Biriyani", "color": "#F79945"}, {"id": 2, "text": "Beef", "color": "#BC5EB3"}, {"id": 3, "text": "Chicken", "color": "#5769e7"}, {"id": 4, "text": "Desert", "color": "#89c6c7"}, {"id": 5, "text": "Fast Food", "color": "#0aa3a3"}], "time_limit": 30}', true, '2026-04-19 05:34:35', '2026-04-19 05:34:35', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (89, 133, 'Sort these numbers in ascending order', NULL, 'sorting', 7, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "20", "color": "#F79945"}, {"id": 2, "text": "50", "color": "#BC5EB3"}, {"id": 3, "text": "30", "color": "#5769e7"}, {"id": 4, "text": "60", "color": "#89c6c7"}], "time_limit": 30}', true, '2026-04-19 05:34:35', '2026-04-19 05:34:35', NULL, 5, 'private');
INSERT INTO public.quest_tasks (id, quest_id, title, description, task_type, serial_number, task_data, is_required, created_at, updated_at, deleted_at, owner_id, visibility) VALUES (90, 133, 'How do you feel using this platfdorm?', NULL, 'longanswer', 8, '{"maxText": "Strongly disagree", "minText": "Strongly agree", "layout_id": null, "maxNumber": 0, "minNumber": 0, "questions": [{"id": 1, "text": "Item 1", "color": "#F79945"}], "time_limit": 30}', true, '2026-04-19 05:34:35', '2026-04-19 05:34:35', NULL, 5, 'private');


ALTER TABLE public.quest_tasks ENABLE TRIGGER ALL;

--
-- Data for Name: quest_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quest_sessions DISABLE TRIGGER ALL;

INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (131, 133, 'QUEST-133-20260419053614-XT2I5U', '2026-04-19 05:36:14', '2026-04-19 05:38:45', 'UTC', '2026-04-19 05:36:15', '2026-04-19 05:38:45', NULL, 'All_Question_Test_Apr_19_11_35_AM', false, 'xjx706ixweughdbpisgltypjx3bimnrp', 83, '{"status": "running", "start_time": "April 19th 2026, 11:38:32", "duration_seconds": 30, "remaining_seconds": 30}');
INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (86, 87, 'QUEST-87-20260417184034-3GZTKE', '2026-04-17 18:40:34', '2026-04-17 19:30:37', 'UTC', '2026-04-17 18:40:35', '2026-04-17 19:30:37', NULL, 'My_Quest_Test_Apr_18_00_40_AM', false, 'bnskmhdkhjqprttmtj0fdlafkbkbogid', 49, '{"status": "running", "start_time": "April 18th 2026, 12:42:15", "duration_seconds": 30, "remaining_seconds": 30}');
INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (176, 133, 'QUEST-133-20260419093249-40NFK5', '2026-04-19 09:32:49', '2026-04-19 09:35:42', 'UTC', '2026-04-19 09:32:50', '2026-04-19 09:35:42', NULL, 'All_Question_Test_Apr_19_15_32_PM', false, 'o2jfvl90fwwjrucpefaodoykoxawirbr', 90, '{"status": "running", "start_time": "April 19th 2026, 3:35:27", "duration_seconds": 30, "remaining_seconds": 30}');
INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (132, 133, 'QUEST-133-20260419070757-TGWMYC', '2026-04-19 07:07:57', '2026-04-19 07:18:17', 'UTC', '2026-04-19 07:07:59', '2026-04-19 07:18:17', NULL, 'All_Question_Test_Apr_19_13_07_PM', false, 'nxai9229gv26lgbml5j4jkezzl07fyvj', 90, '{"status": "running", "start_time": "April 19th 2026, 1:17:28", "duration_seconds": 30, "remaining_seconds": 30}');
INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (93, 87, 'QUEST-87-20260417193049-1KCOJ9', '2026-04-17 19:30:49', '2026-04-17 19:33:29', 'UTC', '2026-04-17 19:30:51', '2026-04-17 19:33:29', NULL, 'My_Quest_Test_Apr_18_01_30_AM', false, 'hqyxke4hvsuja5z3qw27eipvtxnybdph', 51, '{"status": "running", "start_time": "April 18th 2026, 1:33:02", "duration_seconds": 30, "remaining_seconds": 30}');
INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (185, 133, 'QUEST-133-20260419095321-IUOFZD', '2026-04-19 09:53:21', '2026-04-19 09:54:47', 'UTC', '2026-04-19 09:53:21', '2026-04-19 09:54:47', NULL, 'All_Question_Test_Apr_19_15_53_PM', false, 'snzkjdr7ocdyrqf6yqcxmxhu8b1witd8', 90, '{"status": "running", "start_time": "April 19th 2026, 3:54:31", "duration_seconds": 30, "remaining_seconds": 30}');
INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (159, 133, 'QUEST-133-20260419091256-WDQUML', '2026-04-19 09:12:56', '2026-04-19 09:14:42', 'UTC', '2026-04-19 09:12:56', '2026-04-19 09:14:42', NULL, 'All_Question_Test_Apr_19_15_12_PM', false, 'kb9lubge0kuciy9ffzcimivs2i7o2x2d', 88, '{"status": "running", "start_time": "April 19th 2026, 3:14:09", "duration_seconds": 30, "remaining_seconds": 30}');
INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (106, 87, 'QUEST-87-20260418065005-O82EEZ', '2026-04-18 06:50:05', '2026-04-18 08:51:56', 'UTC', '2026-04-18 06:50:05', '2026-04-18 08:51:55', NULL, 'My_Quest_Test_Apr_18_12_49_PM', false, 'i7tfmmj2zquji3aynn55nmjq1qgw7zyi', 51, '{"status": "running", "start_time": "April 18th 2026, 12:52:08", "duration_seconds": 30, "remaining_seconds": 30}');
INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (133, 133, 'QUEST-133-20260419085308-DSQY0F', '2026-04-19 08:53:08', '2026-04-19 09:10:34', 'UTC', '2026-04-19 08:53:09', '2026-04-19 09:10:34', NULL, 'All_Question_Test_Apr_19_13_19_PM', false, 'iwfcvspba1b6egocxfbx7glzzlrdwbpj', NULL, NULL);
INSERT INTO public.quest_sessions (id, quest_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, title, running_status, public_channel_key, current_task_id, timer_state) VALUES (158, 133, 'QUEST-133-20260419091045-UCJNRZ', '2026-04-19 09:10:45', '2026-04-19 09:12:10', 'UTC', '2026-04-19 09:10:45', '2026-04-19 09:12:10', NULL, 'All_Question_Test_Apr_19_15_10_PM', false, 'nyxklxfuvjxohcvudif78u3dedwqnyky', 88, '{"status": "running", "start_time": "April 19th 2026, 3:11:52", "duration_seconds": 30, "remaining_seconds": 30}');


ALTER TABLE public.quest_sessions ENABLE TRIGGER ALL;

--
-- Data for Name: quest_participants; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quest_participants DISABLE TRIGGER ALL;

INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (52, 87, NULL, true, '{"name": "Chrome", "email": null}', '2026-04-17 18:41:17', NULL, 'In Progress', '2026-04-17 18:41:17', '2026-04-17 19:30:37', 86, 'f0eb56c6f3df80df6ce6127bb12e1229833883de2bd84daa6769b6eb44401f72', '2026-04-18 00:41:17', '2026-04-17 19:30:37');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (53, 87, NULL, true, '{"name": "Edge", "email": null}', '2026-04-17 18:41:22', NULL, 'In Progress', '2026-04-17 18:41:22', '2026-04-17 19:30:37', 86, '842ad03ed0cf1ff078c1199a9ac89734ada11f01ac82b10531150c47c9b7c8ee', '2026-04-18 00:41:22', '2026-04-17 19:30:37');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (58, 87, NULL, true, '{"name": "Chrome", "email": null}', '2026-04-17 19:31:11', NULL, 'In Progress', '2026-04-17 19:31:11', '2026-04-17 19:33:29', 93, '53d0aec2efa27a6e3854390ac56b7b687d0eabd75ab4ceca362b1eba9e7873d0', '2026-04-18 01:31:11', '2026-04-17 19:33:29');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (59, 87, NULL, true, '{"name": "Edge", "email": null}', '2026-04-17 19:31:28', NULL, 'In Progress', '2026-04-17 19:31:28', '2026-04-17 19:33:29', 93, '1cb9cba1ffba4db5dbe3359dd03015e225a67bb2cc06837f5b470a3b01ab790c', '2026-04-18 01:31:28', '2026-04-17 19:33:29');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (91, 133, NULL, true, '{"name": "Chrome", "email": null}', '2026-04-19 05:37:16', NULL, 'In Progress', '2026-04-19 05:37:16', '2026-04-19 05:38:45', 131, 'bfe2600fcefe4d9f6d385ab2bf278282061712913a5466ac2781e8afb7bb2224', '2026-04-19 11:37:16', '2026-04-19 05:38:45');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (92, 133, NULL, true, '{"name": "Edge Incog", "email": null}', '2026-04-19 05:37:17', NULL, 'In Progress', '2026-04-19 05:37:17', '2026-04-19 05:38:45', 131, '5f727f386fb39a0e60edcc3d5c97e7c6a9983671b86840fc218df18317759017', '2026-04-19 11:37:17', '2026-04-19 05:38:45');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (93, 133, NULL, true, '{"name": "Edge Regular", "email": null}', '2026-04-19 05:37:19', NULL, 'In Progress', '2026-04-19 05:37:19', '2026-04-19 05:38:45', 131, 'e3b7c2e89d4f31dba0a7a604cf031091def548194036f3ad08a2aecbebd0ebf6', '2026-04-19 11:37:19', '2026-04-19 05:38:45');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (144, 133, NULL, true, '{"name": "Chrome", "email": null}', '2026-04-19 09:33:16', NULL, 'In Progress', '2026-04-19 09:33:16', '2026-04-19 09:35:42', 176, 'c9c198b953d2d17f27710eb5e0aa085b177571b70595f508a0ddd4727b6a88a0', '2026-04-19 15:33:16', '2026-04-19 09:35:42');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (143, 133, NULL, true, '{"name": "nafew", "email": null}', '2026-04-19 09:33:07', NULL, 'In Progress', '2026-04-19 09:33:07', '2026-04-19 09:35:42', 176, '223e6821c2dd4764be455ae8f3844a28336301707d837090e998c9c2981a299d', '2026-04-19 15:33:07', '2026-04-19 09:35:42');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (68, 87, NULL, true, '{"name": "Edgee", "email": null}', '2026-04-18 06:50:29', NULL, 'In Progress', '2026-04-18 06:50:29', '2026-04-18 06:52:42', 106, '19472d5c0a8f041ec212272235d2f052abb9825f20e76c2e38c01a72520e6084', '2026-04-18 12:50:29', '2026-04-18 06:52:42');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (69, 87, NULL, true, '{"name": "Chromee", "email": null}', '2026-04-18 06:50:38', NULL, 'In Progress', '2026-04-18 06:50:38', '2026-04-18 06:52:42', 106, '9d7aa022345c5c2709ca5aace5df110ac73a3a7eeb9adafe144e77e2b5710ad9', '2026-04-18 12:50:38', '2026-04-18 06:52:42');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (94, 133, NULL, true, '{"name": "Chrome 1", "email": null}', '2026-04-19 07:13:32', NULL, 'In Progress', '2026-04-19 07:13:32', '2026-04-19 07:18:17', 132, 'c57867361c2374a2889b17d9ae30b68349893adc33a9a000f4f85183dbef3584', '2026-04-19 13:13:32', '2026-04-19 07:18:17');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (95, 133, NULL, true, '{"name": "Chrome 2", "email": null}', '2026-04-19 07:13:38', NULL, 'In Progress', '2026-04-19 07:13:38', '2026-04-19 07:18:17', 132, '16c4ad437b7ec415f6518c75bc468b51a6066a08b60e4eb63ce4bf05c1d9872c', '2026-04-19 13:13:38', '2026-04-19 07:18:17');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (96, 133, NULL, true, '{"name": "Chrome 3", "email": null}', '2026-04-19 07:13:43', NULL, 'In Progress', '2026-04-19 07:13:43', '2026-04-19 07:18:17', 132, 'cec31a3f46ec6ca41e670fac5215c5ea66a1a2f3cf004cf224eac97b6f83ef2a', '2026-04-19 13:13:43', '2026-04-19 07:18:17');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (145, 133, NULL, true, '{"name": "Edge", "email": null}', '2026-04-19 09:33:30', NULL, 'In Progress', '2026-04-19 09:33:30', '2026-04-19 09:35:42', 176, 'dff3d9aa856df3295393c7e7bb00ffeb7ec9cd54e804e26ec2982b4af632269b', '2026-04-19 15:33:30', '2026-04-19 09:35:42');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (154, 133, NULL, true, '{"name": "Edge", "email": null}', '2026-04-19 09:53:41', '2026-04-19 09:54:47', 'Completed', '2026-04-19 09:53:41', '2026-04-19 09:54:47', 185, 'e1495df9d0aadbc968ffd6c74710ef9649e16e6d84bc4a3c0572094381db3adf', '2026-04-19 15:53:41', '2026-04-19 09:54:47');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (155, 133, NULL, true, '{"name": "Edge", "email": null}', '2026-04-19 09:53:42', '2026-04-19 09:54:47', 'Completed', '2026-04-19 09:53:42', '2026-04-19 09:54:47', 185, '24cff2aba4f21d806db91172aa2f69e6b3267502e2973f3adc872b91571d792a', '2026-04-19 15:53:42', '2026-04-19 09:54:47');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (156, 133, NULL, true, '{"name": "chrome", "email": null}', '2026-04-19 09:53:50', '2026-04-19 09:54:47', 'Completed', '2026-04-19 09:53:50', '2026-04-19 09:54:47', 185, 'd2ef4754ef01fe988628a0c9aa0e1dfa44fe9ecb6d8c1969f2eedb1f569b5610', '2026-04-19 15:53:50', '2026-04-19 09:54:47');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (122, 133, NULL, true, '{"name": "Chrome 2", "email": null}', '2026-04-19 09:11:08', NULL, 'In Progress', '2026-04-19 09:11:08', '2026-04-19 09:12:10', 158, '6df892d522041b816cddcd4068474f4552d7237f864d18c636405a54085c8537', '2026-04-19 15:11:08', '2026-04-19 09:12:10');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (123, 133, NULL, true, '{"name": "Edgee", "email": null}', '2026-04-19 09:11:16', NULL, 'In Progress', '2026-04-19 09:11:16', '2026-04-19 09:12:10', 158, '386707573543d4ba1670c7ae61fbf56bbfd2c03c3ceedf5000765e809a02098b', '2026-04-19 15:11:16', '2026-04-19 09:12:10');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (121, 133, NULL, true, '{"name": "Nafew", "email": null}', '2026-04-19 09:11:02', NULL, 'In Progress', '2026-04-19 09:11:02', '2026-04-19 09:12:10', 158, '716f4cac1c4dac6cb2efa43b5d78f6283fb5c5b8a802374755c1072b94c48789', '2026-04-19 15:11:02', '2026-04-19 09:12:10');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (124, 133, NULL, true, '{"name": "Chrome", "email": null}', '2026-04-19 09:13:29', NULL, 'In Progress', '2026-04-19 09:13:29', '2026-04-19 09:14:42', 159, 'dd87f9667c1aa48021ba6af9aef98676803ab595019a8f79bb3720cb6c8815e8', '2026-04-19 15:13:29', '2026-04-19 09:14:42');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (125, 133, NULL, true, '{"name": "Incognito", "email": null}', '2026-04-19 09:13:38', NULL, 'In Progress', '2026-04-19 09:13:38', '2026-04-19 09:14:42', 159, '250543863344607984375129f47d80bfb3135c81ceec5b332b476aa21dd7506f', '2026-04-19 15:13:38', '2026-04-19 09:14:42');
INSERT INTO public.quest_participants (id, quest_id, user_id, is_anonymous, anonymous_details, start_time, end_time, status, created_at, updated_at, quest_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (126, 133, NULL, true, '{"name": "Edgee", "email": null}', '2026-04-19 09:13:41', NULL, 'In Progress', '2026-04-19 09:13:41', '2026-04-19 09:14:42', 159, 'bfe1fd348039beea629600a822d928fad6ede609c87cc27256f52e477538e586', '2026-04-19 15:13:41', '2026-04-19 09:14:42');


ALTER TABLE public.quest_participants ENABLE TRIGGER ALL;

--
-- Data for Name: quest_task_completions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quest_task_completions DISABLE TRIGGER ALL;

INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (155, 155, 88, 'Completed', '2026-04-19 09:54:17', '{"start_time": "2026-04-19 15:54:16", "selected_option": ["wf"]}', '2026-04-19 09:54:17', '2026-04-19 09:54:17');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (20, 53, 47, 'Completed', '2026-04-17 18:41:53', '{"start_time": "2026-04-18 00:41:52", "selected_option": 1}', '2026-04-17 18:41:53', '2026-04-17 18:41:53');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (21, 52, 47, 'Completed', '2026-04-17 18:42:00', '{"start_time": "2026-04-18 00:41:59", "selected_option": 3}', '2026-04-17 18:42:00', '2026-04-17 18:42:00');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (23, 53, 49, 'Completed', '2026-04-17 18:42:29', '{"start_time": "2026-04-18 00:42:28", "selected_option": ["rverevervre", "rvreverber"]}', '2026-04-17 18:42:27', '2026-04-17 18:42:29');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (22, 52, 49, 'Completed', '2026-04-17 18:42:33', '{"start_time": "2026-04-18 00:42:32", "selected_option": ["skennvkewnrv", "erververber"]}', '2026-04-17 18:42:22', '2026-04-17 18:42:33');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (25, 59, 47, 'Completed', '2026-04-17 19:32:00', '{"start_time": "2026-04-18 01:31:58", "selected_option": 0}', '2026-04-17 19:32:00', '2026-04-17 19:32:00');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (26, 58, 47, 'Completed', '2026-04-17 19:32:07', '{"start_time": "2026-04-18 01:32:05", "selected_option": 1}', '2026-04-17 19:32:07', '2026-04-17 19:32:07');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (27, 58, 49, 'Completed', '2026-04-17 19:32:38', '{"start_time": "2026-04-18 01:32:36", "selected_option": ["rwgv"]}', '2026-04-17 19:32:38', '2026-04-17 19:32:38');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (28, 59, 49, 'Completed', '2026-04-17 19:32:42', '{"start_time": "2026-04-18 01:32:40", "selected_option": ["vwvw"]}', '2026-04-17 19:32:42', '2026-04-17 19:32:42');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (29, 59, 50, 'Completed', '2026-04-17 19:32:50', '{"start_time": "2026-04-18 01:32:49", "selected_option": 0}', '2026-04-17 19:32:50', '2026-04-17 19:32:50');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (30, 58, 50, 'Completed', '2026-04-17 19:32:55', '{"start_time": "2026-04-18 01:32:55", "selected_option": 0}', '2026-04-17 19:32:55', '2026-04-17 19:32:55');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (31, 59, 51, 'Completed', '2026-04-17 19:33:21', '{"start_time": "2026-04-18 01:33:20", "selected_option": [2, 0, 3, 1, 4]}', '2026-04-17 19:33:21', '2026-04-17 19:33:21');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (32, 58, 51, 'Completed', '2026-04-17 19:33:24', '{"start_time": "2026-04-18 01:33:24", "selected_option": [0, 2, 4, 1, 3]}', '2026-04-17 19:33:24', '2026-04-17 19:33:24');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (35, 69, 47, 'Completed', '2026-04-18 06:51:10', '{"start_time": "2026-04-18 12:51:10", "selected_option": 2}', '2026-04-18 06:51:10', '2026-04-18 06:51:10');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (36, 68, 47, 'Completed', '2026-04-18 06:51:17', '{"start_time": "2026-04-18 12:51:17", "selected_option": 3}', '2026-04-18 06:51:17', '2026-04-18 06:51:17');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (37, 68, 49, 'Completed', '2026-04-18 06:51:32', '{"start_time": "2026-04-18 12:51:32", "selected_option": ["Hdbuejasbnchu"]}', '2026-04-18 06:51:32', '2026-04-18 06:51:32');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (38, 69, 49, 'Completed', '2026-04-18 06:51:46', '{"start_time": "2026-04-18 12:51:46", "selected_option": ["fvdv dv edfrver", "fd fd", "fder", "ytnuymg"]}', '2026-04-18 06:51:39', '2026-04-18 06:51:46');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (39, 69, 50, 'Completed', '2026-04-18 06:52:00', '{"start_time": "2026-04-18 12:51:59", "selected_option": 1}', '2026-04-18 06:52:00', '2026-04-18 06:52:00');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (40, 68, 50, 'Completed', '2026-04-18 06:52:03', '{"start_time": "2026-04-18 12:52:02", "selected_option": 0}', '2026-04-18 06:52:03', '2026-04-18 06:52:03');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (41, 69, 51, 'Completed', '2026-04-18 06:52:21', '{"start_time": "2026-04-18 12:52:21", "selected_option": [0, 1, 2, 3, 4]}', '2026-04-18 06:52:21', '2026-04-18 06:52:21');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (42, 68, 51, 'Completed', '2026-04-18 06:52:30', '{"start_time": "2026-04-18 12:52:29", "selected_option": [3, 4, 1, 2, 0]}', '2026-04-18 06:52:30', '2026-04-18 06:52:30');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (64, 94, 88, 'Completed', '2026-04-19 07:14:00', '{"start_time": "2026-04-19 13:14:00", "selected_option": ["Nafew"]}', '2026-04-19 07:14:00', '2026-04-19 07:14:00');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (65, 95, 88, 'Completed', '2026-04-19 07:14:09', '{"start_time": "2026-04-19 13:14:07", "selected_option": ["Incognito"]}', '2026-04-19 07:14:09', '2026-04-19 07:14:09');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (66, 96, 88, 'Completed', '2026-04-19 07:14:14', '{"start_time": "2026-04-19 13:14:13", "selected_option": ["Bruuuh!"]}', '2026-04-19 07:14:14', '2026-04-19 07:14:14');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (67, 94, 83, 'Completed', '2026-04-19 07:14:32', '{"start_time": "2026-04-19 13:14:31", "selected_option": 1}', '2026-04-19 07:14:32', '2026-04-19 07:14:32');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (68, 95, 83, 'Completed', '2026-04-19 07:14:34', '{"start_time": "2026-04-19 13:14:34", "selected_option": 3}', '2026-04-19 07:14:34', '2026-04-19 07:14:34');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (69, 96, 83, 'Completed', '2026-04-19 07:14:36', '{"start_time": "2026-04-19 13:14:36", "selected_option": 4}', '2026-04-19 07:14:36', '2026-04-19 07:14:36');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (70, 94, 84, 'Completed', '2026-04-19 07:14:48', '{"start_time": "2026-04-19 13:14:47", "selected_option": 0}', '2026-04-19 07:14:48', '2026-04-19 07:14:48');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (72, 96, 84, 'Completed', '2026-04-19 07:14:52', '{"start_time": "2026-04-19 13:14:51", "selected_option": 1}', '2026-04-19 07:14:52', '2026-04-19 07:14:52');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (71, 95, 84, 'Completed', '2026-04-19 07:15:00', '{"start_time": "2026-04-19 13:14:59", "selected_option": 1}', '2026-04-19 07:14:50', '2026-04-19 07:15:00');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (73, 94, 85, 'Completed', '2026-04-19 07:15:13', '{"start_time": "2026-04-19 13:15:13", "selected_option": ["Artificial Intelligence", "Overhyped"]}', '2026-04-19 07:15:11', '2026-04-19 07:15:13');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (75, 96, 85, 'Completed', '2026-04-19 07:15:34', '{"start_time": "2026-04-19 13:15:34", "selected_option": ["Artificial Intelligence", "Overhyped", "Overrated", "Overhyped", "Overhyped", "Machine Learning"]}', '2026-04-19 07:15:20', '2026-04-19 07:15:34');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (74, 95, 85, 'Completed', '2026-04-19 07:15:45', '{"start_time": "2026-04-19 13:15:45", "selected_option": ["Overrated", "Machine Learning", "Bruuuh"]}', '2026-04-19 07:15:17', '2026-04-19 07:15:45');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (76, 94, 86, 'Completed', '2026-04-19 07:16:19', '{"start_time": "2026-04-19 13:16:18", "selected_option": [10, 5, 6, 8, 6]}', '2026-04-19 07:16:19', '2026-04-19 07:16:19');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (77, 95, 86, 'Completed', '2026-04-19 07:16:29', '{"start_time": "2026-04-19 13:16:28", "selected_option": [7, 7, 4, 4, 8]}', '2026-04-19 07:16:22', '2026-04-19 07:16:29');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (78, 94, 87, 'Completed', '2026-04-19 07:16:47', '{"start_time": "2026-04-19 13:16:46", "selected_option": [0, 2, 1, 3, 4]}', '2026-04-19 07:16:47', '2026-04-19 07:16:47');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (79, 95, 87, 'Completed', '2026-04-19 07:16:51', '{"start_time": "2026-04-19 13:16:50", "selected_option": [0, 1, 4, 3, 2]}', '2026-04-19 07:16:51', '2026-04-19 07:16:51');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (80, 96, 87, 'Completed', '2026-04-19 07:16:58', '{"start_time": "2026-04-19 13:16:58", "selected_option": [2, 1, 0, 4, 3]}', '2026-04-19 07:16:58', '2026-04-19 07:16:58');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (81, 94, 89, 'Completed', '2026-04-19 07:17:13', '{"start_time": "2026-04-19 13:17:12", "selected_option": [0, 2, 1, 3]}', '2026-04-19 07:17:13', '2026-04-19 07:17:13');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (82, 95, 89, 'Completed', '2026-04-19 07:17:21', '{"start_time": "2026-04-19 13:17:19", "selected_option": [0, 3, 1, 2]}', '2026-04-19 07:17:21', '2026-04-19 07:17:21');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (83, 96, 89, 'Completed', '2026-04-19 07:17:25', '{"start_time": "2026-04-19 13:17:24", "selected_option": [3, 2, 0, 1]}', '2026-04-19 07:17:25', '2026-04-19 07:17:25');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (84, 94, 90, 'Completed', '2026-04-19 07:17:34', '{"start_time": "2026-04-19 13:17:34", "selected_option": ["jcfgjhwgcfjswehgjf"]}', '2026-04-19 07:17:34', '2026-04-19 07:17:34');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (85, 95, 90, 'Completed', '2026-04-19 07:17:42', '{"start_time": "2026-04-19 13:17:41", "selected_option": ["fdszgVGBre", "wevwvw"]}', '2026-04-19 07:17:38', '2026-04-19 07:17:42');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (86, 96, 90, 'Completed', '2026-04-19 07:17:43', '{"start_time": "2026-04-19 13:17:43", "selected_option": ["erabveabaerb", "wevwev"]}', '2026-04-19 07:17:40', '2026-04-19 07:17:43');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (156, 156, 90, 'Completed', '2026-04-19 09:54:36', '{"start_time": "2026-04-19 15:54:36", "selected_option": ["efwef"]}', '2026-04-19 09:54:36', '2026-04-19 09:54:36');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (157, 155, 90, 'Completed', '2026-04-19 09:54:39', '{"start_time": "2026-04-19 15:54:39", "selected_option": ["fweghsdacsx"]}', '2026-04-19 09:54:39', '2026-04-19 09:54:39');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (122, 143, 88, 'Completed', '2026-04-19 09:33:44', '{"start_time": "2026-04-19 15:33:44", "selected_option": ["weffcwef"]}', '2026-04-19 09:33:44', '2026-04-19 09:33:44');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (123, 144, 88, 'Completed', '2026-04-19 09:33:46', '{"start_time": "2026-04-19 15:33:46", "selected_option": ["wfgegw"]}', '2026-04-19 09:33:46', '2026-04-19 09:33:46');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (124, 145, 88, 'Completed', '2026-04-19 09:33:47', '{"start_time": "2026-04-19 15:33:47", "selected_option": ["wgeg"]}', '2026-04-19 09:33:47', '2026-04-19 09:33:47');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (125, 145, 83, 'Completed', '2026-04-19 09:33:54', '{"start_time": "2026-04-19 15:33:55", "selected_option": 4}', '2026-04-19 09:33:54', '2026-04-19 09:33:54');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (126, 144, 83, 'Completed', '2026-04-19 09:33:58', '{"start_time": "2026-04-19 15:33:56", "selected_option": 2}', '2026-04-19 09:33:58', '2026-04-19 09:33:58');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (127, 143, 83, 'Completed', '2026-04-19 09:33:59', '{"start_time": "2026-04-19 15:33:58", "selected_option": 1}', '2026-04-19 09:33:59', '2026-04-19 09:33:59');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (128, 143, 84, 'Completed', '2026-04-19 09:34:08', '{"start_time": "2026-04-19 15:34:07", "selected_option": 0}', '2026-04-19 09:34:08', '2026-04-19 09:34:08');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (129, 144, 84, 'Completed', '2026-04-19 09:34:09', '{"start_time": "2026-04-19 15:34:08", "selected_option": 1}', '2026-04-19 09:34:09', '2026-04-19 09:34:09');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (130, 145, 84, 'Completed', '2026-04-19 09:34:10', '{"start_time": "2026-04-19 15:34:10", "selected_option": 1}', '2026-04-19 09:34:10', '2026-04-19 09:34:10');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (131, 143, 85, 'Completed', '2026-04-19 09:34:19', '{"start_time": "2026-04-19 15:34:19", "selected_option": ["Artificial Intelligence"]}', '2026-04-19 09:34:19', '2026-04-19 09:34:19');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (132, 144, 85, 'Completed', '2026-04-19 09:34:21', '{"start_time": "2026-04-19 15:34:20", "selected_option": ["Overrated"]}', '2026-04-19 09:34:21', '2026-04-19 09:34:21');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (133, 145, 85, 'Completed', '2026-04-19 09:34:23', '{"start_time": "2026-04-19 15:34:23", "selected_option": ["Overhyped"]}', '2026-04-19 09:34:23', '2026-04-19 09:34:23');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (134, 143, 86, 'Completed', '2026-04-19 09:34:36', '{"start_time": "2026-04-19 15:34:35", "selected_option": [8, 5, 9, 4, 9]}', '2026-04-19 09:34:36', '2026-04-19 09:34:36');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (135, 144, 86, 'Completed', '2026-04-19 09:34:46', '{"start_time": "2026-04-19 15:34:45", "selected_option": [9, 5, 5, 3, 8]}', '2026-04-19 09:34:46', '2026-04-19 09:34:46');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (136, 145, 86, 'Completed', '2026-04-19 09:34:49', '{"start_time": "2026-04-19 15:34:48", "selected_option": [0, 0, 0, 0, 0]}', '2026-04-19 09:34:49', '2026-04-19 09:34:49');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (137, 145, 87, 'Completed', '2026-04-19 09:35:04', '{"start_time": "2026-04-19 15:35:04", "selected_option": [2, 3, 4, 1, 0]}', '2026-04-19 09:35:04', '2026-04-19 09:35:04');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (138, 144, 87, 'Completed', '2026-04-19 09:35:07', '{"start_time": "2026-04-19 15:35:05", "selected_option": [0, 1, 2, 3, 4]}', '2026-04-19 09:35:07', '2026-04-19 09:35:07');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (139, 143, 87, 'Completed', '2026-04-19 09:35:08', '{"start_time": "2026-04-19 15:35:07", "selected_option": [0, 2, 1, 3, 4]}', '2026-04-19 09:35:08', '2026-04-19 09:35:08');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (140, 145, 89, 'Completed', '2026-04-19 09:35:22', '{"start_time": "2026-04-19 15:35:22", "selected_option": [1, 2, 3, 0]}', '2026-04-19 09:35:22', '2026-04-19 09:35:22');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (141, 144, 89, 'Completed', '2026-04-19 09:35:24', '{"start_time": "2026-04-19 15:35:23", "selected_option": [3, 2, 1, 0]}', '2026-04-19 09:35:24', '2026-04-19 09:35:24');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (142, 143, 89, 'Completed', '2026-04-19 09:35:25', '{"start_time": "2026-04-19 15:35:25", "selected_option": [0, 1, 2, 3]}', '2026-04-19 09:35:25', '2026-04-19 09:35:25');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (143, 143, 90, 'Completed', '2026-04-19 09:35:30', '{"start_time": "2026-04-19 15:35:30", "selected_option": ["wEGG"]}', '2026-04-19 09:35:30', '2026-04-19 09:35:30');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (144, 144, 90, 'Completed', '2026-04-19 09:35:31', '{"start_time": "2026-04-19 15:35:31", "selected_option": ["WEGEWG"]}', '2026-04-19 09:35:31', '2026-04-19 09:35:31');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (145, 145, 90, 'Completed', '2026-04-19 09:35:33', '{"start_time": "2026-04-19 15:35:33", "selected_option": ["EWGWG"]}', '2026-04-19 09:35:33', '2026-04-19 09:35:33');
INSERT INTO public.quest_task_completions (id, participant_id, task_id, status, completed_at, completion_data, created_at, updated_at) VALUES (154, 156, 88, 'Completed', '2026-04-19 09:54:16', '{"start_time": "2026-04-19 15:54:14", "selected_option": ["d"]}', '2026-04-19 09:54:16', '2026-04-19 09:54:16');


ALTER TABLE public.quest_task_completions ENABLE TRIGGER ALL;

--
-- Data for Name: quest_task_dependencies; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quest_task_dependencies DISABLE TRIGGER ALL;



ALTER TABLE public.quest_task_dependencies ENABLE TRIGGER ALL;

--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.questions DISABLE TRIGGER ALL;

INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (1, 1, NULL, '.', NULL, NULL, NULL, false, NULL, NULL, 'public', NULL, NULL, '2026-04-16 06:39:51', '2026-04-16 06:39:51', 5);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (2, 1, 1, 'Untitled questionwdwd', 'sort_answer_choice', NULL, NULL, false, NULL, '{"color": ["#F79945", "#BC5EB3"], "choices": ["wdwdw", "wdwdw"], "correct_answer": [0, 1]}', 'private', NULL, NULL, '2026-04-16 06:41:04', '2026-04-16 06:44:22', 5);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (3, 1, 2, 'Untitled questionwdfwd', 'quiz_single_choice', NULL, NULL, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["wdwd", "dwdw", "wdwdw", "dwdwd"], "correct_answer": 2}', 'private', NULL, NULL, '2026-04-16 06:41:10', '2026-04-16 06:44:22', 5);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (4, 1, 3, 'Untitled questioncwcw', 'quiz_single_choice', NULL, NULL, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["wdwd", "wdwd", "wdwd", "wdwd"], "correct_answer": 3}', 'private', NULL, NULL, '2026-04-16 06:41:31', '2026-04-16 06:44:22', 5);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (62, 1, NULL, '.', NULL, NULL, NULL, false, NULL, NULL, 'public', NULL, NULL, '2026-04-18 17:46:05', '2026-04-18 17:46:05', 5);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (63, 91, 1, 'What type of allocation does the platform offer?', 'quiz_multiple_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["Dynamic Allocation", "Static Allocation", "Manual Allocation", "Sporadic Allocation"], "correct_answer": [0]}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (64, 91, 2, 'Which AI feature allows students to understand historical figures?', 'quiz_single_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["AI Interactive Scenarios", "AI Virtual Dialogues", "AI Knowledge Base", "AI Teaching Assistant"], "correct_answer": 1}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (65, 91, 3, 'AI helps design learning activities.', 'true_false_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["True", "False", null, null], "correct_answer": 0}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (66, 91, 4, 'The platform supports coding in C, Python, MySQL, and __.', 'fill_in_the_blanks_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["Linux", "Java", "HTML", "Ruby"], "correct_answer": 0}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (67, 91, 5, 'Name one type of AI teaching assistant.', 'sort_answer_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["General AI Assistant", "Scenario-based Assistant", "AI Tools", null], "correct_answer": [0, 1, 2, 3]}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (68, 91, 6, 'What does the platform offer for vocational training simulations?', 'quiz_single_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["Mock Interviews", "Traditional Lectures", "Online Quizzes", "Textbook Resources"], "correct_answer": 0}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (69, 91, 7, 'What method is used to improve peer review?', 'quiz_multiple_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["AI grading", "Evaluation advice", "Manual feedback", "Automated scoring"], "correct_answer": [0, 1]}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (70, 91, 8, 'Which department is mentioned in the input material?', 'quiz_single_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["Marketing Solution and Planning Dept.", "IT Support Dept.", "Human Resources Dept.", "Finance Dept."], "correct_answer": 0}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (71, 91, 9, 'AI serves as a personal tutor.', 'true_false_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["True", "False", null, null], "correct_answer": 0}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);
INSERT INTO public.questions (id, quiz_id, serial_number, question_text, question_type, time_limit_seconds, points, is_ai_generated, source_content_url, options, visibility, deleted_at, deleted_by, created_at, updated_at, owner_id) VALUES (72, 91, 10, 'What is used to build a Competency Graph with AI?', 'fill_in_the_blanks_choice', NULL, 1, false, NULL, '{"color": ["#F79945", "#BC5EB3", "#5769e7", "#89c6c7"], "choices": ["AI Analysis", "Human Review", "Model Optimization", "Data Processing"], "correct_answer": 1}', 'private', NULL, NULL, '2026-04-18 17:50:08', '2026-04-18 17:50:25', NULL);


ALTER TABLE public.questions ENABLE TRIGGER ALL;

--
-- Data for Name: quiz_q_bank_categories; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quiz_q_bank_categories DISABLE TRIGGER ALL;



ALTER TABLE public.quiz_q_bank_categories ENABLE TRIGGER ALL;

--
-- Data for Name: quiz_bank_questions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quiz_bank_questions DISABLE TRIGGER ALL;



ALTER TABLE public.quiz_bank_questions ENABLE TRIGGER ALL;

--
-- Data for Name: quizes; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quizes DISABLE TRIGGER ALL;

INSERT INTO public.quizes (id, title, description, category_id, is_published, is_live, open_datetime, close_datetime, quiztime_mode, duration, logged_in_users_only, safe_browser_mode, visibility, quiz_mode, timezone, join_link, join_code, deleted_at, user_id, deleted_by, created_at, updated_at, origin_owner_id, origin_owner_name, origin_owner_profile_picture) VALUES (60, 'My Quiz', NULL, NULL, false, false, NULL, NULL, true, NULL, false, false, 'public', 'normal', 'Asia/Dhaka', 'gdu-acu-hb9-9ja', '909529', NULL, 5, NULL, '2026-04-17 18:32:27', '2026-04-17 18:32:27', NULL, NULL, NULL);
INSERT INTO public.quizes (id, title, description, category_id, is_published, is_live, open_datetime, close_datetime, quiztime_mode, duration, logged_in_users_only, safe_browser_mode, visibility, quiz_mode, timezone, join_link, join_code, deleted_at, user_id, deleted_by, created_at, updated_at, origin_owner_id, origin_owner_name, origin_owner_profile_picture) VALUES (1, 'Test Quiz', NULL, NULL, true, false, '2026-04-16 06:40:43', '2026-04-22 06:40:43', true, 10, false, false, 'public', 'normal', 'UTC', 'jpe-btw-5ra-ovu', '372413', NULL, 5, NULL, '2026-04-16 06:39:50', '2026-04-18 14:03:39', NULL, NULL, NULL);
INSERT INTO public.quizes (id, title, description, category_id, is_published, is_live, open_datetime, close_datetime, quiztime_mode, duration, logged_in_users_only, safe_browser_mode, visibility, quiz_mode, timezone, join_link, join_code, deleted_at, user_id, deleted_by, created_at, updated_at, origin_owner_id, origin_owner_name, origin_owner_profile_picture) VALUES (91, 'ZTE AI Platform', NULL, NULL, true, false, '2026-04-18 17:50:06', '2026-04-19 17:50:06', true, NULL, false, false, 'public', 'normal', 'Asia/Dhaka', 'gwu-omw-sdm-rfs', '251891', NULL, 5, NULL, '2026-04-18 17:46:11', '2026-04-18 17:50:08', NULL, NULL, NULL);


ALTER TABLE public.quizes ENABLE TRIGGER ALL;

--
-- Data for Name: quiz_origins; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quiz_origins DISABLE TRIGGER ALL;



ALTER TABLE public.quiz_origins ENABLE TRIGGER ALL;

--
-- Data for Name: quiz_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quiz_sessions DISABLE TRIGGER ALL;

INSERT INTO public.quiz_sessions (id, quiz_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, is_host_live, title, running_status, join_link, join_code, quiztime_mode, quiz_mode, public_channel_key, current_question_id, timer_state) VALUES (91, 91, 'QUIZ-91-20260418175030-TOWPPZ', '2026-04-18 17:50:30', '2026-04-18 17:53:59', 'Asia/Dhaka', '2026-04-18 17:50:30', '2026-04-18 17:53:59', NULL, true, 'ZTE_AI_Platform_Apr_18_23_50_PM', false, NULL, NULL, NULL, 'quiz', 'cp8ndqjnrk9p2gn3prcmnscafocjrdhc', 72, '{"status": "running", "start_time": "April 18th 2026, 11:53:25", "duration_seconds": 0, "remaining_seconds": 0}');
INSERT INTO public.quiz_sessions (id, quiz_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, is_host_live, title, running_status, join_link, join_code, quiztime_mode, quiz_mode, public_channel_key, current_question_id, timer_state) VALUES (84, 1, 'QUIZ-1-20260418140339-5LXDS3', '2026-04-18 14:03:39', '2026-04-22 06:40:43', 'UTC', '2026-04-18 14:03:40', '2026-04-18 14:03:40', NULL, true, 'quiz_Title_Apr_18_20_03_PM', true, 'grg-ike-nb2-nyc', '017087', NULL, NULL, 'ctensjpxydgpmwjq2ehrthvqzssweg8a', NULL, NULL);
INSERT INTO public.quiz_sessions (id, quiz_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, is_host_live, title, running_status, join_link, join_code, quiztime_mode, quiz_mode, public_channel_key, current_question_id, timer_state) VALUES (85, 1, 'QUIZ-1-20260418140341-QPOGAD', '2026-04-18 14:03:41', '2026-04-18 17:44:47', 'UTC', '2026-04-18 14:03:42', '2026-04-18 17:44:47', NULL, true, 'quiz_Title_Apr_18_20_03_PM', false, NULL, NULL, NULL, 'quiz', '6kwxfys1tkbpnca6m4ox8npmcwfvweja', 4, '{"status": "running", "start_time": "April 18th 2026, 11:44:29", "duration_seconds": 0, "remaining_seconds": 0}');
INSERT INTO public.quiz_sessions (id, quiz_id, session_id, start_datetime, end_datetime, timezone, created_at, updated_at, deleted_at, is_host_live, title, running_status, join_link, join_code, quiztime_mode, quiz_mode, public_channel_key, current_question_id, timer_state) VALUES (92, 91, 'QUIZ-91-20260419054130-TUJHZZ', '2026-04-19 05:41:30', '2026-04-19 17:50:06', 'Asia/Dhaka', '2026-04-19 05:41:31', '2026-04-19 05:42:15', NULL, true, 'ZTE_AI_Platform_Apr_19_11_41_AM', true, 'dw9-9qf-tta-24p', '568422', NULL, 'quiz', 'h1zmtrkurt0trms1ubcqf21yb1egnhz9', 63, '{"status": "running", "start_time": "April 19th 2026, 11:42:15", "duration_seconds": 0, "remaining_seconds": 0}');


ALTER TABLE public.quiz_sessions ENABLE TRIGGER ALL;

--
-- Data for Name: quiz_participants; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.quiz_participants DISABLE TRIGGER ALL;

INSERT INTO public.quiz_participants (id, quiz_id, user_id, is_anonymous, anonymous_details, start_time, end_time, score, status, created_at, updated_at, quiz_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (43, 1, NULL, true, '{"name": "Nafew", "email": null}', '2026-04-18 14:04:09', NULL, 0, 'In Progress', '2026-04-18 14:04:09', '2026-04-18 17:44:47', 85, '793119b25656f806b3c5b2d120ed2ed608a0e7d998c21fd2ae5150e0f505733c', '2026-04-18 20:04:09', '2026-04-18 17:44:47');
INSERT INTO public.quiz_participants (id, quiz_id, user_id, is_anonymous, anonymous_details, start_time, end_time, score, status, created_at, updated_at, quiz_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (47, 91, NULL, true, '{"name": "Nafew", "email": null}', '2026-04-18 17:50:46', NULL, 0, 'In Progress', '2026-04-18 17:50:46', '2026-04-18 17:53:59', 91, '96e4435843a19f78ca706551409e361a1593d89bd84c75732407c1379404b7cd', '2026-04-18 23:50:46', '2026-04-18 17:53:59');
INSERT INTO public.quiz_participants (id, quiz_id, user_id, is_anonymous, anonymous_details, start_time, end_time, score, status, created_at, updated_at, quiz_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (48, 91, NULL, true, '{"name": "Nafew", "email": null}', '2026-04-18 17:51:26', NULL, 0, 'In Progress', '2026-04-18 17:51:26', '2026-04-18 17:53:59', 91, '81a546328986aa579f8c29c915201801e3ea3fe25990476b9c3992087d88f73e', '2026-04-18 23:51:26', '2026-04-18 17:53:59');
INSERT INTO public.quiz_participants (id, quiz_id, user_id, is_anonymous, anonymous_details, start_time, end_time, score, status, created_at, updated_at, quiz_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (49, 91, NULL, true, '{"name": "Edge", "email": null}', '2026-04-19 05:41:55', NULL, 0, 'In Progress', '2026-04-19 05:41:55', '2026-04-19 05:41:55', 92, '10aba2b5718256c03a60e774e92f8836a930c2c9b98efbc6210772c675aab208', '2026-04-19 11:41:55', NULL);
INSERT INTO public.quiz_participants (id, quiz_id, user_id, is_anonymous, anonymous_details, start_time, end_time, score, status, created_at, updated_at, quiz_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (50, 91, NULL, true, '{"name": "Edgee", "email": null}', '2026-04-19 05:41:57', NULL, 0, 'In Progress', '2026-04-19 05:41:57', '2026-04-19 05:41:57', 92, '093663ee0e4a3322fce890b88e2b87a75d4b35f91478c8266f9f9f7d1339bc07', '2026-04-19 11:41:57', NULL);
INSERT INTO public.quiz_participants (id, quiz_id, user_id, is_anonymous, anonymous_details, start_time, end_time, score, status, created_at, updated_at, quiz_session_id, participant_token_hash, participant_token_expires_at, participant_token_revoked_at) VALUES (51, 91, NULL, true, '{"name": "Chrome", "email": null}', '2026-04-19 05:42:12', NULL, 0, 'In Progress', '2026-04-19 05:42:12', '2026-04-19 05:42:12', 92, 'd2d9e1108d85b25eebeade41ac3b7c544402ed68b0a2edcb9b4504d676e1c155', '2026-04-19 11:42:12', NULL);


ALTER TABLE public.quiz_participants ENABLE TRIGGER ALL;

--
-- Data for Name: role_has_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.role_has_permissions DISABLE TRIGGER ALL;



ALTER TABLE public.role_has_permissions ENABLE TRIGGER ALL;

--
-- Data for Name: user_quiz_answers; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.user_quiz_answers DISABLE TRIGGER ALL;

INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (20, 43, 2, '{"start_time": "2026-04-18 20:04:30", "end_time_now": "2026-04-18T14:04:32.856459Z", "start_time_now": "2026-04-18 20:04:30", "selected_option": ["jcanjncjqwebbe", "evecdcwsw evev evev eeve"]}', 0, '2026-04-18 14:04:22', '2026-04-18 14:04:32');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (22, 43, 3, '{"end_time": "2026-04-18 23:44:25", "start_time": "2026-04-18 11:44:19", "end_time_now": "2026-04-18 23:44:25", "start_time_now": "2026-04-18 11:44:19", "selected_option": 1}', 43206, '2026-04-18 17:44:26', '2026-04-18 17:44:26');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (23, 43, 4, '{"end_time": "2026-04-18 23:44:38", "start_time": "2026-04-18 11:44:29", "end_time_now": "2026-04-18 23:44:38", "start_time_now": "2026-04-18 11:44:29", "selected_option": 2}', 43209, '2026-04-18 17:44:38', '2026-04-18 17:44:38');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (24, 47, 63, '{"end_time": "2026-04-18 23:51:02", "start_time": "2026-04-18 11:50:49", "end_time_now": "2026-04-18 23:51:02", "start_time_now": "2026-04-18 11:50:49", "selected_option": 0}', 43213, '2026-04-18 17:51:02', '2026-04-18 17:51:02');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (25, 48, 64, '{"end_time": "2026-04-18 23:51:29", "start_time": "2026-04-18 11:51:05", "end_time_now": "2026-04-18 23:51:29", "start_time_now": "2026-04-18 11:51:05", "selected_option": 1}', 43224, '2026-04-18 17:51:30', '2026-04-18 17:51:30');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (26, 48, 65, '{"end_time": "2026-04-18 23:51:38", "start_time": "2026-04-18 11:51:32", "end_time_now": "2026-04-18 23:51:38", "start_time_now": "2026-04-18 11:51:32", "selected_option": 0}', 43206, '2026-04-18 17:51:39', '2026-04-18 17:51:39');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (27, 48, 66, '{"end_time": "2026-04-18 23:51:57", "start_time": "2026-04-18 11:51:45", "end_time_now": "2026-04-18 23:51:57", "start_time_now": "2026-04-18 11:51:45", "selected_option": 1}', 43212, '2026-04-18 17:51:59', '2026-04-18 17:51:59');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (28, 48, 67, '{"start_time": "2026-04-18 23:52:10", "end_time_now": "2026-04-18T17:52:11.249641Z", "start_time_now": "2026-04-18 23:52:10", "selected_option": ["AI"]}', 0, '2026-04-18 17:52:11', '2026-04-18 17:52:11');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (29, 48, 68, '{"end_time": "2026-04-18 23:52:34", "start_time": "2026-04-18 11:52:14", "end_time_now": "2026-04-18 23:52:34", "start_time_now": "2026-04-18 11:52:14", "selected_option": 2}', 43220, '2026-04-18 17:52:36', '2026-04-18 17:52:36');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (30, 48, 69, '{"end_time": "2026-04-18 23:52:53", "start_time": "2026-04-18 11:52:42", "end_time_now": "2026-04-18 23:52:53", "start_time_now": "2026-04-18 11:52:42", "selected_option": 0}', 43211, '2026-04-18 17:52:53', '2026-04-18 17:52:53');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (31, 48, 70, '{"end_time": "2026-04-18 23:53:13", "start_time": "2026-04-18 11:52:56", "end_time_now": "2026-04-18 23:53:13", "start_time_now": "2026-04-18 11:52:56", "selected_option": 0}', 43217, '2026-04-18 17:53:15', '2026-04-18 17:53:15');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (32, 48, 71, '{"end_time": "2026-04-18 23:53:22", "start_time": "2026-04-18 11:53:16", "end_time_now": "2026-04-18 23:53:22", "start_time_now": "2026-04-18 11:53:16", "selected_option": 0}', 43206, '2026-04-18 17:53:22', '2026-04-18 17:53:22');
INSERT INTO public.user_quiz_answers (id, quiz_participant_id, question_id, answer_data, time_taken_seconds, created_at, updated_at) VALUES (33, 48, 72, '{"end_time": "2026-04-18 23:53:48", "start_time": "2026-04-18 11:53:25", "end_time_now": "2026-04-18 23:53:48", "start_time_now": "2026-04-18 11:53:25", "selected_option": 3}', 43223, '2026-04-18 17:53:49', '2026-04-18 17:53:49');


ALTER TABLE public.user_quiz_answers ENABLE TRIGGER ALL;

--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.files_id_seq', 1, true);


--
-- Name: institutions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.institutions_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);


--
-- Name: preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.preferences_id_seq', 7, true);


--
-- Name: quest_bank_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_bank_tasks_id_seq', 1, false);


--
-- Name: quest_origins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_origins_id_seq', 1, false);


--
-- Name: quest_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_participants_id_seq', 156, true);


--
-- Name: quest_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_sessions_id_seq', 185, true);


--
-- Name: quest_task_bank_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_task_bank_categories_id_seq', 1, true);


--
-- Name: quest_task_completions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_task_completions_id_seq', 157, true);


--
-- Name: quest_task_dependencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_task_dependencies_id_seq', 1, false);


--
-- Name: quest_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_tasks_id_seq', 127, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.questions_id_seq', 90, true);


--
-- Name: quests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quests_id_seq', 181, true);


--
-- Name: quiz_bank_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_bank_questions_id_seq', 1, false);


--
-- Name: quiz_origins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_origins_id_seq', 1, false);


--
-- Name: quiz_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_participants_id_seq', 75, true);


--
-- Name: quiz_q_bank_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_q_bank_categories_id_seq', 1, false);


--
-- Name: quiz_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_sessions_id_seq', 122, true);


--
-- Name: quizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quizes_id_seq', 121, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, true);


--
-- Name: user_quiz_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_quiz_answers_id_seq', 39, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 348, true);


--
-- PostgreSQL database dump complete
--

\unrestrict ib2N6qhuy4lRnhefP8xX5b9QrfwFJaMTXX6mAKJTDkY32IDd0a7sxxVk6MOKVmQ

