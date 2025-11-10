import { useState } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Vote, Check } from 'lucide-react';
import type { SnapshotProposal } from '@shared/treasury-types';

interface ProposalVotingProps {
  proposal: SnapshotProposal;
  onVoteSuccess?: () => void;
}

const SNAPSHOT_HUB_URL = 'https://hub.snapshot.org/api/msg';

export function ProposalVoting({ proposal, onVoteSuccess }: ProposalVotingProps) {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const { toast } = useToast();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const isActive = proposal.state === 'active';

  const handleVote = async () => {
    if (!address || !isConnected || selectedChoice === null) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and select a choice',
        variant: 'destructive',
      });
      return;
    }

    setIsVoting(true);

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const message = {
        from: address,
        space: 'kongsdao.eth',
        timestamp,
        proposal: proposal.id,
        choice: selectedChoice,
        reason: '',
        app: 'kingdao-dashboard',
        metadata: '{}',
      };

      const domain = {
        name: 'snapshot',
        version: '0.1.4',
      };

      const types = {
        Vote: [
          { name: 'from', type: 'address' },
          { name: 'space', type: 'string' },
          { name: 'timestamp', type: 'uint64' },
          { name: 'proposal', type: 'bytes32' },
          { name: 'choice', type: 'uint32' },
          { name: 'reason', type: 'string' },
          { name: 'app', type: 'string' },
          { name: 'metadata', type: 'string' },
        ],
      };

      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Vote',
        message,
      });

      const response = await fetch(SNAPSHOT_HUB_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          sig: signature,
          data: {
            domain,
            types,
            message,
            primaryType: 'Vote',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error_description || 'Failed to submit vote');
      }

      const result = await response.json();

      setHasVoted(true);
      toast({
        title: 'Vote Submitted',
        description: `Your vote has been recorded on Snapshot`,
      });

      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error: any) {
      console.error('Voting error:', error);
      toast({
        title: 'Voting Failed',
        description: error.message || 'Failed to submit vote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (!isActive) {
    return null;
  }

  if (hasVoted) {
    return (
      <Card className="rounded-2xl border border-green-400/20 bg-green-500/10 backdrop-blur-xl p-4 mt-4">
        <div className="flex items-center gap-2 text-green-400">
          <Check className="h-5 w-5" />
          <span className="font-semibold">Vote submitted successfully</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-white/10 bg-card/30 backdrop-blur-xl p-4 mt-4">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-3">Cast Your Vote</h4>
          <div className="space-y-2">
            {proposal.choices?.map((choice, index) => (
              <button
                key={index}
                onClick={() => setSelectedChoice(index + 1)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  selectedChoice === index + 1
                    ? 'border-primary bg-primary/10 hover-elevate'
                    : 'border-white/10 bg-card/50 hover-elevate'
                }`}
                data-testid={`button-vote-choice-${index}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{choice}</span>
                  {selectedChoice === index + 1 && (
                    <Badge variant="default" className="rounded-full">
                      Selected
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleVote}
          disabled={!isConnected || selectedChoice === null || isVoting}
          className="w-full gap-2"
          data-testid="button-submit-vote"
        >
          {isVoting ? (
            <>Submitting Vote...</>
          ) : (
            <>
              <Vote className="h-4 w-4" />
              Submit Vote
            </>
          )}
        </Button>

        {!isConnected && (
          <p className="text-xs text-muted-foreground text-center">
            Connect your wallet to vote
          </p>
        )}
      </div>
    </Card>
  );
}
