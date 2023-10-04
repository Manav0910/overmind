import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import CountUp from "react-countup";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";

export type Stream = {
  sender: string;
  recipient: string;
  amountAptFloat: number;
  durationMilliseconds: number;
  startTimestampMilliseconds: number;
  streamId: number;
};

export default function CreatedStreamList(props: {
  isTxnInProgress: boolean;
  setTxn: (isTxnInProgress: boolean) => void;
}) {
  // Wallet state
  const { connected, account, signAndSubmitTransaction } = useWallet();
  // Toast state
  const { toast } = useToast();
  // Streams state
  const [streams, setStreams] = useState<Stream[]>([]);
  const [areStreamsLoading, setAreStreamsLoading] = useState(true);

  /* 
    Retrieve the streams from the module and set the streams state.
  */
  useEffect(() => {
    if (connected) {
      getSenderStreams().then((streams) => {
        setStreams(streams);
        setAreStreamsLoading(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, connected, props.isTxnInProgress]);

  /*
    Cancels a selected stream.
  */
  const cancelStream = async (recipient: string) => {
    /*
      TODO #7: Validate the account is defined before continuing. If not, return.
    */
    if (!account) {
      return;
    }
    /* 
      TODO #8: Set the isTxnInProgress state to true. This will display the loading spinner.
    */
    props.setTxn(true);
    /*
      TODO #9: Make a request to the entry function `cancel_stream` to cancel the stream. 
      
      HINT: 
        - In case of an error, set the isTxnInProgress state to false and return.
        - In case of success, display a toast notification with the transaction hash.

      -- Toast notification --
      toast({
        title: "Stream closed!",
        description: `Closed stream for ${`${recipient.slice(
          0,
          6
        )}...${recipient.slice(-4)}`}`,
        action: (
          <a
            href={`PLACEHOLDER: Input the explorer link here with the transaction hash`}
            target="_blank"
          >
            <ToastAction altText="View transaction">View txn</ToastAction>
          </a>
        ),
      });
    */
    let res: any;
    try {
      const body = {
        function: "cancel_stream",
        type_arguments: ["sender_address", "receiver_address"],
        arguments: [account.address, recipient],
      };
      res = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/view`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        props.setTxn(false);
        return;
      }
      toast({
        title: "Stream closed!",
        description: `Closed stream for ${`${recipient.slice(
          0,
          6
        )}...${recipient.slice(-4)}`}`,
        action: (
          <a
            href={`PLACEHOLDER: Input the explorer link here with the transaction hash`}
            target="_blank"
          >
            <ToastAction altText="View transaction">View txn</ToastAction>
          </a>
        ),
      });
    } catch (err) {
      props.setTxn(false);
      return;
    }
    /*
      TODO #10: Set the isTxnInProgress state to false. This will hide the loading spinner.
    */
    props.setTxn(false);
  };

  /* 
    Retrieves the sender streams. 
  */
  const getSenderStreams = async () => {
    /*
      TODO #4: Validate the account is defined before continuing. If not, return.
    */
    if (!account) {
      return;
    }

    /*
      TODO #5: Make a request to the view function `get_senders_streams` to retrieve the streams sent by 
            the user.
    */
    let res: any;
    try {
      const body = {
        function: "get_senders_streams",
        type_arguments: ["sender_address"],
        arguments: [account.address],
      };
      res = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/view`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
    } catch (err) {
      console.log(err);
      return [];
    }

    /* 
      TODO #6: Parse the response from the view request and create the streams array using the given 
            data. Return the new streams array.

      HINT:
        - Remember to convert the amount to floating point number
    */

    const streams = res.map(
      (stream: {
        receiver_addresses: any;
        start_timestamp_seconds: any;
        duration_in_seconds: any;
        stream_amounts: string;
        stream_ids: any;
      }) => ({
        receiver_addresses: stream.receiver_addresses,
        start_timestamp_seconds: stream.start_timestamp_seconds,
        duration_in_seconds: stream.duration_in_seconds,
        stream_amounts: parseFloat(stream.stream_amounts),
        stream_ids: stream.stream_ids,
      })
    );

    return streams;
  };

  return (
    <ScrollArea className="rounded-lg bg-neutral-400 border border-neutral-200 w-full">
      <div className="h-fit max-h-96 w-full">
        <Table className="w-full">
          <TableHeader className="bg-neutral-300">
            <TableRow className="uppercase text-xs font-matter hover:bg-neutral-300">
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Recipient</TableHead>
              <TableHead className="text-center">End date</TableHead>
              <TableHead className="text-center">Remaining amount</TableHead>
              <TableHead className="text-center">Cancel stream</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 
                TODO #1: Add a skeleton loader when the streams are loading. Use the provided Skeleton component.

                HINT:
                  - Use the areStreamsLoading state to determine if the streams are loading.
                
                -- Skeleton loader -- 
                <TableRow>
                  <TableCell className="items-center">
                    <div className="flex flex-row justify-center items-center w-full">
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </TableCell>
                  <TableCell className="items-center">
                    <div className="flex flex-row justify-center items-center w-full">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="items-center">
                    <div className="flex flex-row justify-center items-center w-full">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="items-center">
                    <div className="flex flex-row justify-center items-center w-full">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="items-center">
                    <div className="flex flex-row justify-center items-center w-full">
                      <Skeleton className="h-8 w-12" />
                    </div>
                  </TableCell>
                </TableRow>
              */}
            {areStreamsLoading && (
              <TableRow>
                <TableCell className="items-center">
                  <div className="flex flex-row justify-center items-center w-full">
                    <Skeleton className="h-4 w-4" />
                  </div>
                </TableCell>
                <TableCell className="items-center">
                  <div className="flex flex-row justify-center items-center w-full">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell className="items-center">
                  <div className="flex flex-row justify-center items-center w-full">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell className="items-center">
                  <div className="flex flex-row justify-center items-center w-full">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell className="items-center">
                  <div className="flex flex-row justify-center items-center w-full">
                    <Skeleton className="h-8 w-12" />
                  </div>
                </TableCell>
              </TableRow>
            )}
            {/* 
                TODO #2: Add a row to the table when there are no streams. Use the provided component
                          to display the message.

                HINT:
                  - Use the areStreamsLoading state to determine if the streams are loading.
                  - Use the streams state to determine if there are any streams.

                -- message component --
                <TableRow className="hover:bg-neutral-400">
                  <TableCell colSpan={5}>
                    <p className="break-normal text-center font-matter py-4 text-neutral-100">
                      You don&apos;t have any outgoing payments.
                    </p>
                  </TableCell>
                </TableRow>
              */}
            {!areStreamsLoading && streams.length === 0 && (
              <TableRow className="hover:bg-neutral-400">
                <TableCell colSpan={5}>
                  <p className="break-normal text-center font-matter py-4 text-neutral-100">
                    You don&apos;t have any outgoing payments.
                  </p>
                </TableCell>
              </TableRow>
            )}
            {/* 
                TODO #3: Add a row to the table for each stream in the streams array. Use the provided
                          component to display the stream information.

                HINT:
                  - Use the areStreamsLoading state to determine if the streams are loading. Don't display
                    the streams if they are loading.
                  - Use the streams state to determine if there are any streams. 

                -- stream component --
                <TableRow
                  key={index}
                  className="font-matter hover:bg-neutral-400"
                >
                  <TableCell className="text-center">
                    PLACEHOLDER: Input the stream id here {0}
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>PLACEHOLDER: truncate recipient address here</TooltipTrigger>
                        <TooltipContent>
                          <p>PLACEHOLDER: full recipient address here</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-center">
                    {
                      TODO: Display the end date of the stream. If the stream has not started, 
                            display a message saying "Stream has not started". Use the provided 
                            component to display the date.

                      HINT: 
                        - Use the startTimestampMilliseconds to determine if the stream has started.
                        - Use the durationMilliseconds and startTimestampMilliseconds to calculate 
                          the end date.
                    
                      -- date component --
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {endDate.toLocaleDateString()}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{endDate.toLocaleString()}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      -- message component --
                      <p>
                        <i>Stream has not started</i>
                      </p>
                    }
                  </TableCell>
                  <TableCell className="font-mono text-center">
                    {
                      TODO: Display the remaining amount of the stream. If the stream has not started,
                            display the full amount. Use the provided component to display the amount.
                      
                      HINT:
                        - Use the startTimestampMilliseconds to determine if the stream has started.
                        - Use the durationMilliseconds and startTimestampMilliseconds to determine if 
                          the stream has finished.

                      -- amount component (show when stream is completed) --
                      <p>0.00 APT</p>

                      -- amount component (show when stream is not completed) --
                      <CountUp
                        start={amountRemaining}
                        end={0}
                        duration={stream.durationMilliseconds / 1000}
                        decimals={8}
                        decimal="."
                        suffix=" APT"
                        useEasing={false}
                      />

                      -- amount component (show when stream has not started) --
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            PLACEHOLDER: Input the amount here (format to 2 decimal places)
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              PLACEHOLDER: Input the amount here (format to 8 decimal places)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      className="bg-red-800 hover:bg-red-700 text-white"
                      onClick={() => console.log('PLACEHOLDER: cancel stream')}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              */}

            {!areStreamsLoading &&
              streams.length > 0 &&
              streams.map((stream, index) => (
                <TableRow
                  key={index}
                  className="font-matter hover:bg-neutral-400"
                >
                  <TableCell className="text-center">
                    {stream.streamId} {/* Display the stream id */}
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          PLACEHOLDER: truncate recipient address here
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>PLACEHOLDER: full recipient address here</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  <TableCell className="text-center">
                    {stream.startTimestampMilliseconds > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {stream.startTimestampMilliseconds +
                              stream.durationMilliseconds}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {stream.startTimestampMilliseconds +
                                stream.durationMilliseconds}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <p>
                        <i>Stream has not started</i>
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-center">
                    {stream.startTimestampMilliseconds === 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {stream.amountAptFloat.toFixed(2)} APT
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{stream.amountAptFloat.toFixed(8)} APT</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : stream.durationMilliseconds +
                        stream.startTimestampMilliseconds <
                      Date.now() ? (
                      <p>0.00 APT</p>
                    ) : (
                      <CountUp
                        start={stream.amountAptFloat}
                        end={0}
                        duration={stream.durationMilliseconds / 1000}
                        decimals={8}
                        decimal="."
                        suffix=" APT"
                        useEasing={false}
                      />
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      className="bg-red-800 hover:bg-red-700 text-white"
                      onClick={() => cancelStream(stream.recipient)}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
}
