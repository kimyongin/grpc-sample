# grpc-sample

game_client --(grpc)--> game_server

nx_command_client --(http, jsonBody)--> nx_command_server --(grpc, protoMessage)--> game_server
